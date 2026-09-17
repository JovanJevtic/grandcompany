# Fotografije proizvoda

Svaka fotografija ovdje mora nositi ime šifre artikla iz kataloga, na primjer:

    KNF-001.jpg   Knauf gips-kartonska ploča GKB 12,5 mm
    CHM-004.jpg   Ceresit CT 85 ljepilo i masa za armiranje
    PRF-075.jpg   Pocinčani zidni profil CW 75

Poslije ubacivanja fotografija pokrenite:

    python3 tools/sync-photos.py

Skripta upisuje fotografije u `js/data.js`, pa se one odmah pojave u katalogu,
na stranici artikla i u korpi. Artikal bez fotografije zadržava svoj crtež.

Preporuka za snimanje: artikal na jednoličnoj svijetloj pozadini, cijelo
pakovanje u kadru, bez drugih proizvoda, širina najmanje 1200 piksela.

Izvori koje smijemo koristiti: fotografije stovarišta Grand Company, fotografije
iz distributerskih paketa Knaufa i Henkela (uz njihovu saglasnost) ili kupljene
stock fotografije. Fotografije preuzete sa tuđih sajtova nisu dozvoljene.
