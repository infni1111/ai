from TTS.api import TTS

# 1. Choisir un modèle TTS disponible
# La librairie va automatiquement télécharger le modèle si nécessaire
tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")

# 2. Le texte à transformer en audio
texte = "Bonjour Infni, voici un test de synthèse vocale avec TTS."

# 3. Générer le fichier audio localement
tts.tts_to_file(text=texte, file_path="sortie_audio.wav")

print("Audio généré : sortie_audio.wav")
