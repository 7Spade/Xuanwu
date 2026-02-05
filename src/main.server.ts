import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { config } from './app/core/providers/app.config.server';

const bootstrap = (context: BootstrapContext) =>
    bootstrapApplication(AppComponent, config, context);

export default bootstrap;
