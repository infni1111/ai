from TTS.api import TTS

# Charger un modèle multilingue
tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")

# Générer une voix féminine en français avec vitesse lente
tts.tts_to_file(
    text="Bonjour, ceci est une voix féminine en français, avec une diction plus lente.",
    file_path="sortie_multilingue.wav",
    speaker="female",   # si plusieurs voix disponibles
    language="fr",
    speed=0.8
)
