import { CanDeactivate } from '@angular/router';
import {ComponentCanDeactivate} from './component-can-deactivate';
import { Observable } from 'rxjs';

export class PendingChangesGuard implements CanDeactivate<ComponentCanDeactivate> {
  canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
    if(component.canDeactivate()) {
      return true;
    } else {
      return true;
      //return confirm('You have unsaved changes. Press Cancel to go back and save these changes, or OK to lose these changes.');
    }
  }
}