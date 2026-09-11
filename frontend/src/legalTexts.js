// ══════════════════════════════════════════════════════════════
//  TEXTES LÉGAUX — BabyWatch
//
//  ⚠️ AVANT MISE EN LIGNE : remplacez tous les champs [[ ... ]]
//     par vos informations réelles. Tant qu'ils sont présents,
//     les documents ne sont pas valables.
//
//  ⚠️ Ces textes sont des modèles sérieux mais NON validés
//     juridiquement. Une relecture par un avocat est nécessaire :
//     vous traitez des données de santé d'enfants mineurs.
// ══════════════════════════════════════════════════════════════

export const LAST_UPDATE = "11 septembre 2026";

// ──────────────────────────────────────────────────────────────
//  1. MENTIONS LÉGALES
// ──────────────────────────────────────────────────────────────
export const MENTIONS_LEGALES = `
## Éditeur du site

**[[RAISON SOCIALE]]**
[[Forme juridique — SAS, SARL, auto-entrepreneur…]]
Capital social : [[montant]] €
Siège social : [[adresse complète]]
SIREN / SIRET : [[numéro]]
RCS : [[ville et numéro]]
TVA intracommunautaire : [[numéro]]

Directeur de la publication : [[Prénom Nom]]
Contact : [[email de contact]]
Téléphone : [[numéro]]

## Hébergement

**Application web (frontend)**
Vercel Inc.
340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis
vercel.com

**Serveur applicatif et base de données**
Railway Corp.
États-Unis (région US West)
railway.app

**Stockage des documents d'identité**
Cloudinary Ltd.
cloudinary.com

**Envoi des emails transactionnels**
Resend
resend.com

## Propriété intellectuelle

L'ensemble des éléments composant le site — structure, textes, logos,
images, charte graphique, code source — est la propriété exclusive de
[[RAISON SOCIALE]], sauf mention contraire.

Toute reproduction, représentation, modification ou exploitation, totale
ou partielle, sans autorisation écrite préalable est interdite et
constitue une contrefaçon au sens des articles L.335-2 et suivants du
Code de la propriété intellectuelle.

## Signalement de contenu illicite

Conformément à la loi n°2004-575 du 21 juin 2004 pour la confiance dans
l'économie numérique, tout contenu illicite peut être signalé à
[[email de contact]]. Nous nous engageons à traiter tout signalement
dans les meilleurs délais.

## Médiation de la consommation

Conformément à l'article L.612-1 du Code de la consommation, vous pouvez
recourir gratuitement au médiateur de la consommation suivant en cas de
litige non résolu :

[[Nom du médiateur — adhésion obligatoire pour toute activité B2C]]
[[Adresse et site web du médiateur]]

Plateforme européenne de règlement en ligne des litiges :
https://ec.europa.eu/consumers/odr
`;

// ──────────────────────────────────────────────────────────────
//  2. POLITIQUE DE CONFIDENTIALITÉ
// ──────────────────────────────────────────────────────────────
export const CONFIDENTIALITE = `
La protection de vos données, et tout particulièrement celles concernant
vos enfants, est au cœur de notre responsabilité. Cette politique explique
sans détour quelles données nous collectons, pourquoi, où elles sont
stockées et quels sont vos droits.

## 1. Responsable du traitement

**[[RAISON SOCIALE]]**
[[Adresse du siège]]
Contact pour toute question relative aux données : [[email DPO ou contact]]

## 2. Données que nous collectons

### 2.1 — Compte et identité

Nom, prénom, adresse email, mot de passe (chiffré, jamais lisible par nous),
numéro de téléphone, date et lieu de naissance, adresse postale complète,
pays.

### 2.2 — Localisation

Les coordonnées GPS correspondant à votre adresse, calculées afin d'afficher
les babysitters proches de votre domicile. Si vous l'autorisez, votre
position approximative au moment de consulter la carte.

### 2.3 — Documents d'identité (babysitters uniquement)

Photographie de votre carte nationale d'identité, passeport ou titre de
séjour, ainsi que le type et le numéro du document. Ces documents sont
examinés par un membre de notre équipe afin de vérifier votre identité.

### 2.4 — Données concernant vos enfants (parents uniquement)

Prénom, date de naissance, genre, heure du coucher, habitudes, activités
préférées, peurs, ainsi que :

- **allergies**
- **médicaments et posologies**
- **notes médicales**
- coordonnées du médecin traitant
- contact d'urgence

**Ces informations constituent des données de santé au sens de l'article 9
du RGPD.** Elles bénéficient d'une protection renforcée et ne sont traitées
que sur la base de votre consentement explicite, que vous donnez en
remplissant volontairement ces champs.

Vous n'êtes jamais obligé de les renseigner. Vous pouvez créer une fiche
enfant sans aucune information médicale.

### 2.5 — Accès au domicile

Si vous choisissez de les renseigner : nom de votre réseau Wi-Fi, mot de
passe associé et précisions éventuelles. Ces champs sont entièrement
facultatifs.

### 2.6 — Réservations et échanges

Dates, horaires, durées, adresses de garde, tarifs, statuts, avis et notes,
ainsi que le contenu des messages échangés entre parent et babysitter.

### 2.7 — Vidéo

Lorsque la surveillance par caméra est activée, le flux transite directement
entre les deux appareils (technologie WebRTC, pair-à-pair). **Aucune image
n'est enregistrée ni ne transite par nos serveurs.** Rien n'est conservé.

### 2.8 — Données techniques

Adresse IP, type de navigateur, journaux de connexion, jeton de session.

## 3. Pourquoi nous traitons ces données

| Finalité | Base légale |
|---|---|
| Créer et gérer votre compte | Exécution du contrat |
| Mettre en relation parents et babysitters | Exécution du contrat |
| Afficher les babysitters proches | Exécution du contrat |
| Vérifier l'identité des babysitters | Intérêt légitime — sécurité des enfants |
| Transmettre les informations de santé à la babysitter | **Consentement explicite (art. 9.2.a)** |
| Transmettre l'accès Wi-Fi | Consentement |
| Envoyer emails de confirmation et rappels | Exécution du contrat |
| Émettre factures et attestations fiscales | Obligation légale |
| Sécuriser les comptes (2FA) | Intérêt légitime |

## 4. Qui a accès à vos données

### Entre utilisateurs

- **La babysitter** voit votre nom, l'adresse de la garde et, **uniquement
  pour une garde confirmée**, les fiches des enfants concernés ainsi que
  l'accès Wi-Fi si vous l'avez renseigné. Cet accès est vérifié côté serveur :
  aucune autre babysitter ne peut y accéder.
- **Le parent** voit le nom, la ville, le tarif, la note et le statut de
  vérification de la babysitter. Il ne voit jamais son document d'identité.
- Votre **numéro de téléphone n'est pas communiqué** : les échanges passent
  par la messagerie intégrée.

### Notre équipe

Seules les personnes habilitées consultent les documents d'identité, dans
le seul but de valider une vérification.

### Nos prestataires

| Prestataire | Rôle | Localisation |
|---|---|---|
| Vercel | Hébergement de l'application | États-Unis |
| Railway | Serveur et base de données | **États-Unis (US West)** |
| Cloudinary | Stockage des documents d'identité | États-Unis / international |
| Resend | Envoi des emails | États-Unis |
| Stripe | Paiement (non activé à ce jour) | États-Unis / Irlande |
| OpenStreetMap | Fond de carte | Europe |

## 5. Transfert hors Union européenne

**Nous devons être transparents sur ce point : vos données, y compris les
informations de santé de vos enfants, sont actuellement hébergées sur des
serveurs situés aux États-Unis.**

Ces transferts s'appuient sur les clauses contractuelles types de la
Commission européenne et, le cas échéant, sur la certification de nos
prestataires au Data Privacy Framework.

Nous travaillons à la migration de notre base de données vers une région
européenne. Cette page sera mise à jour dès que ce sera effectif.

## 6. Durée de conservation

| Donnée | Durée |
|---|---|
| Compte actif | Toute la durée d'utilisation |
| Compte inactif | 3 ans après la dernière connexion |
| Documents d'identité | Supprimés dès la vérification effectuée, ou en cas de rejet |
| Fiches enfants | Jusqu'à suppression par vous, ou clôture du compte |
| Accès Wi-Fi | Jusqu'à suppression par vous, ou clôture du compte |
| Messages | 1 an après la garde |
| Factures | 10 ans (obligation comptable) |
| Journaux de connexion | 12 mois |

## 7. Sécurité

Mots de passe hachés avec bcrypt et jamais stockés en clair. Connexions
chiffrées en HTTPS. Authentification à deux facteurs disponible. Accès aux
données de garde vérifié côté serveur à chaque requête. Flux vidéo chiffré
de bout en bout, jamais enregistré.

**Limite que nous assumons :** le mot de passe Wi-Fi que vous renseignez est
stocké de manière non chiffrée dans notre base, car il doit être réaffiché
tel quel à la babysitter. Si cette information vous semble sensible, ne la
renseignez pas — le champ est facultatif.

## 8. Vos droits

Conformément au RGPD, vous disposez des droits d'accès, de rectification,
d'effacement, de limitation, d'opposition et de portabilité, ainsi que du
droit de retirer votre consentement à tout moment.

Vous pouvez exercer ces droits directement depuis votre espace personnel
(modification et suppression des fiches enfants, des accès Wi-Fi, du profil)
ou en écrivant à **[[email de contact]]**. Nous répondons sous un mois.

En cas de désaccord, vous pouvez saisir la CNIL : **www.cnil.fr**,
3 place de Fontenoy, 75007 Paris.

## 9. Données des mineurs

Les fiches enfants sont créées et gérées exclusivement par le parent ou le
représentant légal, qui consent au traitement pour le compte de l'enfant.
Aucun mineur ne peut créer de compte sur BabyWatch.

## 10. Cookies

Nous n'utilisons aucun cookie publicitaire ni aucun traceur d'audience.
Seul un stockage local est utilisé pour vous garder connecté et mémoriser
votre langue. Il est strictement nécessaire au fonctionnement du service et
ne requiert pas votre consentement.

## 11. Modifications

Toute modification substantielle vous sera notifiée par email. La date de
dernière mise à jour figure en haut de cette page.
`;

// ──────────────────────────────────────────────────────────────
//  3. CONDITIONS GÉNÉRALES D'UTILISATION
// ──────────────────────────────────────────────────────────────
export const CGU = `
## 1. Objet

BabyWatch est une plateforme de mise en relation entre des parents
recherchant une garde d'enfants à domicile et des personnes proposant ce
service.

**BabyWatch est un intermédiaire technique.** Nous ne sommes ni l'employeur
ni le mandataire des babysitters. Le contrat de prestation se forme
directement entre le parent et la babysitter.

## 2. Inscription

L'inscription est réservée aux personnes majeures et capables. Vous vous
engagez à fournir des informations exactes et à les tenir à jour.

Un même compte peut disposer des deux espaces, parent et babysitter.

Vous êtes responsable de la confidentialité de votre mot de passe. Nous
recommandons vivement l'activation de l'authentification à deux facteurs.

## 3. Vérification d'identité

Les babysitters peuvent soumettre un document d'identité, examiné par notre
équipe sous 24 à 48 heures ouvrées. Un badge « identité vérifiée » apparaît
alors sur leur profil.

**Ce badge atteste que nous avons contrôlé la concordance entre un document
d'identité et les informations du compte. Il ne constitue ni une enquête de
moralité, ni une vérification du casier judiciaire, ni une garantie sur les
compétences ou le comportement de la personne.**

Il appartient au parent de procéder à ses propres vérifications :
entretien préalable, références, documents complémentaires.

## 4. Réservations

Le parent formule une demande précisant date, horaire, durée, adresse et
nombre d'enfants. La babysitter est libre de l'accepter ou de la refuser.
Le contrat se forme à l'acceptation.

Toute annulation doit être signalée dans les meilleurs délais via la
plateforme.

## 5. Tarifs et paiement

Chaque babysitter fixe librement son tarif horaire. Le prix affiché inclut
la durée demandée et, le cas échéant, l'option de surveillance par caméra.

**À ce jour, le paiement en ligne n'est pas activé. Le règlement s'effectue
directement entre le parent et la babysitter.** Cette page sera mise à jour
lors de l'activation du paiement intégré.

## 6. Obligations du parent

- Fournir une adresse exacte et un accès au domicile
- Communiquer toute information utile à la sécurité de l'enfant, notamment
  allergies, traitements et consignes médicales
- Être joignable pendant toute la durée de la garde
- Régler la prestation convenue

## 7. Obligations de la babysitter

- Se présenter à l'heure convenue
- Assurer la sécurité et le bien-être de l'enfant en permanence
- Respecter les consignes transmises, en particulier médicales
- Ne jamais quitter le domicile en laissant l'enfant seul
- Contacter immédiatement le parent, puis les secours, en cas d'urgence
- Ne divulguer aucune information relative à la famille, y compris l'accès
  au domicile ou au réseau Wi-Fi

## 8. Surveillance par caméra

Cette option est activée à la demande du parent et n'est possible que si la
babysitter l'a préalablement acceptée dans son profil.

Le flux transite directement d'appareil à appareil et n'est jamais
enregistré. La babysitter doit être informée de son activation.

**Filmer une personne à son insu est pénalement répréhensible.** L'usage de
cette fonctionnalité relève de la responsabilité du parent.

## 9. Avis

Seuls les parents ayant effectivement réalisé une garde peuvent laisser un
avis. Les avis doivent être sincères et proportionnés. Nous nous réservons
le droit de retirer tout avis injurieux, diffamatoire ou manifestement
étranger à la prestation.

## 10. Responsabilité

BabyWatch fournit une plateforme technique de mise en relation. À ce titre :

- Nous ne sommes pas partie au contrat conclu entre le parent et la babysitter
- Nous ne garantissons ni la qualité, ni la ponctualité, ni le comportement
  des utilisateurs
- Notre responsabilité ne saurait être engagée pour tout dommage survenu
  pendant une garde
- Nous ne garantissons pas une disponibilité ininterrompue du service

**Il est vivement recommandé à chaque babysitter de souscrire une assurance
responsabilité civile professionnelle, et à chaque parent de vérifier la
couverture de son assurance habitation.**

## 11. Comportements interdits

Sont notamment interdits : l'usurpation d'identité, la transmission de
documents falsifiés, le harcèlement, la communication de coordonnées
bancaires via la messagerie, et toute tentative de contournement de la
plateforme après mise en relation.

Tout manquement peut entraîner la suspension immédiate du compte.

## 12. Résiliation

Vous pouvez supprimer votre compte à tout moment depuis votre espace
personnel ou en écrivant à [[email de contact]].

Nous pouvons suspendre un compte en cas de manquement grave, notamment
lorsque la sécurité d'un enfant est en cause.

## 13. Droit applicable

Les présentes conditions sont soumises au droit français. À défaut de
résolution amiable, et après recours au médiateur de la consommation, tout
litige relève des tribunaux français compétents.
`;
