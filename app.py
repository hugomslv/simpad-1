from flask import Flask, render_template, jsonify
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import nfc
import jwt
import base64
import threading
import time

SECRET_KEY = '069332689e9ea429cbe681fbe05b3c403490a38208a0d15cbe967069d18490b7'
ALGORITHM = 'HS256'

# Durée d'un cycle d'écoute avant de re-vérifier le lecteur (en secondes)
CYCLE_DURATION = 10

app = Flask(__name__)
nfc_lock = threading.Lock()


def open_reader():
    """Ouvre le lecteur NFC. Retourne l'instance ou None."""
    try:
        clf = nfc.ContactlessFrontend('usb')
        if clf:
            return clf
        print("Lecteur NFC non trouvé.")
        return None
    except Exception as e:
        print(f"Erreur ouverture lecteur: {e}")
        return None


def read_nfc():
    """
    Attend un badge INDÉFINIMENT, en redémarrant le lecteur si besoin.
    Retourne l'UID quand un badge est détecté.
    """
    with nfc_lock:
        clf = None
        card_uid = None
        
        def on_connect(tag):
            nonlocal card_uid
            card_uid = tag.identifier.hex().upper()
            print(f"Badge détecté, UID: {card_uid}")
            return False
        
        # Boucle infinie : on ne sort que si on a un badge
        while card_uid is None:
            # Ouvrir le lecteur si on n'en a pas
            if clf is None:
                clf = open_reader()
                if clf is None:
                    print("Lecteur indisponible, nouvelle tentative dans 2 sec...")
                    time.sleep(2)
                    continue
            
            # Faire un cycle d'écoute de CYCLE_DURATION secondes
            deadline = time.time() + CYCLE_DURATION
            
            try:
                clf.connect(
                    rdwr={'on-connect': on_connect},
                    terminate=lambda: time.time() > deadline
                )
                # Si on sort sans badge, on boucle juste (le while va recommencer)
                
            except Exception as e:
                print(f"Lecteur a planté: {e}. Redémarrage...")
                # On force la réouverture au prochain tour
                try:
                    clf.close()
                except Exception:
                    pass
                clf = None
                time.sleep(1)
        
        # On a un badge, on ferme proprement et on retourne
        try:
            clf.close()
        except Exception as close_error:
            print(f"Erreur fermeture: {close_error}")
        
        return card_uid


def get_signing_key():
    return base64.b64decode(SECRET_KEY)


def generate_token(card_uid):
    exp = datetime.now(ZoneInfo("Europe/Zurich")) + timedelta(minutes=5)
    return jwt.encode(
        {"card_uid": card_uid, "exp": exp},
        get_signing_key(),
        algorithm=ALGORITHM
    )


@app.route('/')
def index():
    return render_template('Simba.html')


@app.route('/waiting', methods=['GET'])
def wait_for_nfc():
    card_uid = read_nfc()
    token = generate_token(card_uid)
    redirect_url = f"https://app-simba.azurewebsites.net/simba/external/api/v1/pad-dashboard/login?token={token}"
    return jsonify({"redirect_url": redirect_url})


@app.route('/get-pig-login', methods=['GET'])
def get_pig_login():
    token = generate_token("pigUid")
    redirect_url = f"https://app-simba.azurewebsites.net/simba/external/api/v1/pad-dashboard/login?token={token}&user=pig"
    return jsonify({"redirect_url": redirect_url})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)