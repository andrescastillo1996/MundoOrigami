import { addIcons } from 'ionicons';
import {
  addOutline,
  trashOutline,
  createOutline,
  logoGoogle,
  logoFacebook,
  closeCircle,
} from 'ionicons/icons';

export function registrarIconos() {
  addIcons({
    'add-outline': addOutline,
    'trash-outline': trashOutline,
    'create-outline': createOutline,
    'logo-google': logoGoogle,
    'logo-facebook': logoFacebook,
    'close-circle': closeCircle,
  });
}
