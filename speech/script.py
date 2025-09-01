from TTS.api import TTS

# Instancie le TTS avec un modèle français
tts = TTS(model_name="tts_models/fr/css10/vits")

# Texte à convertir
texte = "Bonjour Infni, voici un exemple de voix française très lente."

# Génération audio
# `speed` permet de ralentir ou accélérer la voix (1.0 = normal, <1 = plus lent, >1 = plus rapide)
tts.tts_to_file(text=texte, file_path="sortie_fr.wav", speaker=None, speed=0.6)

print("Audio généré avec succès : sortie_fr.wav")
