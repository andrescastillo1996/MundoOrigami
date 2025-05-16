import { addIcons } from 'ionicons';
import {
  addOutline,
  trashOutline,
  createOutline,
  logoGoogle,
  logoFacebook,
  closeCircle,
  newspaperOutline,
  bookOutline,
  chatboxEllipsesOutline,
  personOutline,
  arrowBackOutline,
} from 'ionicons/icons';

export function registrarIconos() {
  addIcons({
    'add-outline': addOutline,
    'trash-outline': trashOutline,
    'create-outline': createOutline,
    'logo-google': logoGoogle,
    'logo-facebook': logoFacebook,
    'close-circle': closeCircle,
    'newspaper-outline': newspaperOutline,
    'book-outline': bookOutline,
    'chatbox-ellipses-outline': chatboxEllipsesOutline,
    'person-outline': personOutline,
    'arrow-back-outline': arrowBackOutline,
  });
}
