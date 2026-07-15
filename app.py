from flask import Flask, render_template, redirect, url_for, jsonify, request
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
import nfc
import jwt
import base64
import threading
SECRET_KEY = '069332689e9ea429cbe681fbe05b3c403490a38208a0d15cbe967069d18490b7'
ALGORITHM = 'HS256'

app= Flask(__name__)

nfc_lock = threading.Lock()

def read_nfc():
    with nfc_lock:
        try:
            clf = nfc.ContactlessFrontend('usb')
        except Exception as e:
            print(f"Failed to initialize NFC reader: {e}")
            return None

        if not clf:
            print("NFC reader not found. Please connect the device.")
            return None

        print("Waiting for NFC badge...")
        card_uid = None

        def on_connect(tag):
            nonlocal card_uid
            print("Badge detected!")
            card_uid = tag.identifier.hex().upper()
            print(f"Card UID: {card_uid}")
            return False  # Disconnect immediately after reading the tag

        try:
            while True:
                clf.connect(rdwr={'on-connect': on_connect})
                if card_uid:
                    print(f"Returning UID: {card_uid}")
                    return card_uid
        except Exception as e:
            print(f"Error while reading NFC badge: {e}")
        finally:
            try:
                clf.close()
            except Exception as close_error:
                print(f"Error while closing NFC reader: {close_error}")

def get_signing_key():
    # Decode the Base64-encoded secret key
    key_bytes = base64.b64decode(SECRET_KEY)
    return key_bytes
        
@app.route('/')
def index():
    return render_template('Simba.html')

@app.route('/waiting', methods=['GET'])
def wait_for_nfc():
    cardUID = read_nfc()
    if cardUID:
        # Create the JWT token with the NFC data
        utc_time = datetime.utcnow()
        local_time = utc_time.replace(tzinfo=ZoneInfo("UTC")).astimezone(ZoneInfo("Europe/Zurich")) + timedelta(seconds=300)
        print("Local time:", local_time)
        token = jwt.encode({"card_uid": cardUID, "exp": local_time}, get_signing_key(), algorithm=ALGORITHM)
        print(cardUID)
        print(token)
        
        # Return the redirection URL as a JSON response
        redirect_url = f"https://app-simba.azurewebsites.net/simba/external/api/v1/pad-dashboard/login?token={token}"
        #redirect_url = f"http://localhost:8080/simba/external/api/v1/pad-dashboard/login?token={token}"

        return jsonify({"redirect_url": redirect_url})
    
    return jsonify({"error": "No NFC data received"}), 500

@app.route('/get-pig-login', methods=['GET'])
def get_PigLogin():
    utc_time = datetime.utcnow()
    local_time = utc_time.replace(tzinfo=ZoneInfo("UTC")).astimezone(ZoneInfo("Europe/Zurich")) + timedelta(minutes=5)
    token = jwt.encode({"card_uid": "pigUid", "exp": local_time}, get_signing_key(), algorithm=ALGORITHM)
    redirect_url = f"https://app-simba.azurewebsites.net/simba/external/api/v1/pad-dashboard/login?token={token}&user=pig"
    return jsonify({"redirect_url": redirect_url})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
    

