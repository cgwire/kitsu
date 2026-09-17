---
path: "/fr/guides/privacy-security/authentication"
slug: "authentication"
published_at: 2026-09-10
---

# Authentification

<!-- #region body -->

## Activer l’authentification à deux facteurs

**L’authentification à deux facteurs** fournit un niveau de sécurité supplémentaire pour les utilisateurs qui se connectent à Kitsu. Elle peut être activée pour chaque utilisateur, ce qui vous permet de choisir pour quels utilisateurs elle est obligatoire.

Pour l’activer, cliquez sur leur avatar en haut à droite de l’écran, puis sélectionnez **Profil**.
En bas de la page, ils trouveront différentes options d’**authentification à deux facteurs** :

- **TOTP** : cette option vous permet d’utiliser une application d’authentification à deux facteurs comme mot de passe secondaire pour votre compte. La sélection de cette option affichera un QR code qui, une fois scanné dans l’application 2FA de votre choix, vous demandera un code à usage unique à chaque connexion.
- **OTP par e-mail** : similaire au TOTP, mais au lieu d’utiliser une application, le code 2FA est envoyé à votre adresse e-mail.
- **Appareil FIDO** : un appareil FIDO désigne une clé de sécurité matérielle prenant en charge la norme FIDO (Fast IDentity Online) pour l’authentification à deux facteurs (2FA). Si vous possédez l’un de ces appareils, vous pouvez saisir son nom ici afin de l’utiliser pour l’authentification à deux facteurs.

![AUTHENTIFICATION À DEUX FACTEURS](/fr/img/getting-started/2factors.png)

## Authentification OpenID / SSO

Kitsu prend également en charge OpenID Connect (OIDC).

Plutôt que de créer et de gérer un mot de passe distinct pour Kitsu, les membres de l’équipe peuvent se connecter avec les mêmes identifiants que ceux qu’ils utilisent déjà pour tout le reste, si le studio s’appuie déjà sur un système d’identité centralisé tel que Google Workspace, Okta, Azure AD ou un autre fournisseur compatible avec OIDC.

Une fois OIDC activé dans la configuration de votre backend, la page de connexion affiche automatiquement un bouton « Se connecter avec [provider] » à côté de l’option de connexion standard pour :

![Authentification OpenID](/fr/img/openid.webp)

<!-- #endregion body -->

