# TEST IMMEDIAT DES NOTIFICATIONS

## Sur votre telephone vendeur

### 1. Ouvrez Chrome et allez sur votre site

### 2. Connectez-vous en tant que vendeur professionnel ou grossiste

### 3. Ouvrez la console Chrome
- Menu 3 points Plus d outils Console JavaScript
- Ou tapez dans la barre d adresse chrome://inspect

### 4. Executez ce code dans la console

```javascript
// Test immediat
async function test() {
  const reg = await navigator.serviceWorker.ready;
  await reg.showNotification('TEST', {
    body: 'Si vous voyez ceci ca marche',
    icon: '/icon-192x192.png',
    vibrate: [200, 100, 200]
  });
}
test();
```

### 5. Vous devriez voir une notification

Si ca ne marche pas
1. Verifiez la permission
```javascript
console.log(Notification.permission);
```

2. Si ce n est pas granted executez
```javascript
Notification.requestPermission();
```

3. Autorisez et retestez

## Test avec une vraie commande

### Telephone 1 Vendeur
1. Connectez-vous en tant que vendeur
2. Laissez la page ouverte
3. Gardez le telephone a cote de vous

### Telephone 2 ou PC Client
1. Connectez-vous en tant que client
2. Trouvez un produit du vendeur
3. Ajoutez au panier
4. Passez la commande
5. Validez

### Resultat
Le telephone du vendeur doit
- Vibrer
- Afficher une notification
- Montrer le nom du client et le produit

## Si ca ne marche toujours pas

Executez dans la console du vendeur
```javascript
const userId = localStorage.getItem('userId');
localStorage.removeItem(`lastOrderCount_${userId}`);
location.reload();
```

Puis repassez une commande
