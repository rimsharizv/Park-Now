import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { environment } from './app/environment/environment';

import { AppModule } from './app/app.module';


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
