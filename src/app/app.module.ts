import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { FakeDbService } from '@fake-db/fake-db.service';

import 'hammerjs';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { TranslateModule } from '@ngx-translate/core';
import { ContextMenuModule } from '@ctrl/ngx-rightclick';

import { CoreModule } from '@core/core.module';
import { CoreCommonModule } from '@core/common.module';
import { CoreSidebarModule, CoreThemeCustomizerModule } from '@core/components';
import { CardSnippetModule } from '@core/components/card-snippet/card-snippet.module';

import { coreConfig } from 'app/app-config';
import { AuthGuard } from 'app/auth/helpers/auth.guards';
import { JwtInterceptor, ErrorInterceptor } from 'app/auth/helpers';
import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';

import { ContextMenuComponent } from 'app/main/extensions/context-menu/context-menu.component';
import { AnimatedCustomContextMenuComponent } from './main/extensions/context-menu/custom-context-menu/animated-custom-context-menu/animated-custom-context-menu.component';
import { BasicCustomContextMenuComponent } from './main/extensions/context-menu/custom-context-menu/basic-custom-context-menu/basic-custom-context-menu.component';
import { SubMenuCustomContextMenuComponent } from './main/extensions/context-menu/custom-context-menu/sub-menu-custom-context-menu/sub-menu-custom-context-menu.component';
import { LoaderService } from './layout/components/loader/loader.service';
import { LoaderComponent } from './layout/components/loader/loader.component';
import { MaintenanceGuard } from './auth/helpers/maintenance.guard';
import {TarifMssNewComponent} from "./main/tarif-mss/tarif-mss-new/tarif-mss-new.component";
import {DateTimePickerModule} from "./main/forms/form-elements/date-time-picker/date-time-picker.module";
import { TrscriptDashboardComponent } from './script-transporteur/trscript-dashboard/trscript-dashboard.component';
import { TrscriptHistoryComponent } from './script-transporteur/trscript-history/trscript-history.component';
import { TarifTotalCalculeComponent } from './main/tarif-total/tarif-total-calcule/tarif-total-calcule.component';
import {NgxDatatableModule} from "@swimlane/ngx-datatable";


const role = JSON.parse(localStorage.getItem("currentUser"))?.role;
const redirectToPath: string = role == "Client" ? "/repartition/statistique" : "/repartition/list";

const appRoutes: Routes = [
  {
    path: '',
    loadChildren: () => import('./main/forms/form-elements/file-uploader/file-uploader.module').then(m => m.FileUploaderModule),

  },
  {
    path: 'button',
    loadChildren: () => import('./main/components/buttons/buttons.module').then(m => m.ButtonsModule),

  },

  {
    path: 'dashboard',
    loadChildren: () => import('./main/dashboard/dashboard.module').then(m => m.DashboardModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'articles',
    loadChildren: () => import('./main/articles/articles.module').then(m => m.ArticlesModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'fournisseurs',
    loadChildren: () => import('./main/fournisseurs/fournisseurs.module').then(m => m.FournisseursModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'destinataires',
    loadChildren: () => import('./main/destinataire/destinataire.module').then(m => m.DestinataireModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'transporteurs',
    loadChildren: () => import('./main/transporteur/transporteur.module').then(m => m.TransporteurModule)

  },

  {
    path: 'departement',
    loadChildren: () => import('./main/departement/departement.module').then(m => m.DepartementModule)


  },




  {
    path: 'bcs',
    loadChildren: () => import('./main/bonCommand/sortie/boncommandsortie.module').then(m => m.BoncommandsortieModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'ble',
    loadChildren: () => import('./main/bonLivraison/entree/bonlivraisonentree.module').then(m => m.BonlivraisonentreeModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'bls',
    loadChildren: () => import('./main/bonLivraison/sortie/bonlivraisonsortie.module').then(m => m.BonlivraisonsortieModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'ume',
    loadChildren: () => import('./main/uniteManutention/entree/unitemanutentionentree.module').then(m => m.UnitemanutentionentreeModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'ums',
    loadChildren: () => import('./main/uniteManutention/sortie/unitemanutentionsortie.module').then(m => m.UnitemanutentionsortieModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'lve',
    loadChildren: () => import('./main/lettreVoiture/entree/lettrevoitureentree.module').then(m => m.LettrevoitureentreeModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'email',
    loadChildren: () => import('./main/email/email.module').then(m => m.EmailModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'config',
    loadChildren: () => import('./main/config/config.module').then(m => m.ConfigModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'lvs',
    loadChildren: () => import('./main/lettreVoiture/sortie/lettrevoituresortie.module').then(m => m.LettrevoituresortieModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'zone',
    loadChildren: () => import('./main/zoneDepot/zonedepot.module').then(m => m.ZonedepotModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  // {
  //   path: 'repartition',
  //   loadChildren: () => import('./main/script/script.module').then(m => m.ScriptModule),
  //   canActivateChild: [AuthGuard]
  // },
  {
    path: 'repartition',
    loadChildren: () => import('./main/repartition/repartition.module').then(m => m.RepartitionModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'document',
    loadChildren: () => import('./main/script/script.module').then(m => m.ScriptModule),
    canActivateChild: [AuthGuard],
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'miscellaneous',
    loadChildren: () => import('./main/pages/miscellaneous/miscellaneous.module').then(m => m.MiscellaneousModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./main/pages/authentication/authentication.module').then(m => m.AuthenticationModule),
    canActivate: [MaintenanceGuard]
  },
  {
    path: 'media',
    loadChildren: () => import('./main/pages/media/media.module').then(m => m.MediaModule),
    canActivate: [MaintenanceGuard]
  },

  {
    path: 'tarifaff',
    loadChildren: () => import('./main/tarif-aff/tarif-aff.module').then(m => m.TarifAffModule),

  },


  {
    path: 'tarifmss',
    loadChildren: () => import('./main/tarif-mss/tarif-mss.module').then(m => m.TarifMssModule),

  },

  {
    path: 'taxe',
    loadChildren: () => import('./main/taxe/taxe.module').then(m => m.TaxeModule),

  },
  {
    path: '',
    loadChildren: () => import('./main/forms/form-elements/date-time-picker/date-time-picker.module').then(m => m.DateTimePickerModule),

  },

  {
    path: '',
    loadChildren: () => import('./main/forms/form-elements/checkbox/checkbox.module').then(m => m.CheckboxModule),

  },

  {
    path: 'ctt',
    loadChildren: () => import('./main/tarif-total/tarif-total.module').then(m => m.TarifTotalModule),

  },

  {
    path: '',
    redirectTo: redirectToPath,
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: '/miscellaneous/error'
  }
];

@NgModule({
  declarations: [
    AppComponent,
    ContextMenuComponent,
    BasicCustomContextMenuComponent,
    AnimatedCustomContextMenuComponent,
    SubMenuCustomContextMenuComponent,
    LoaderComponent,
    TrscriptDashboardComponent,
    TrscriptHistoryComponent,




  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        HttpClientInMemoryWebApiModule.forRoot(FakeDbService, {
            delay: 0,
            passThruUnknownUrl: true
        }),
        RouterModule.forRoot(appRoutes, {
            scrollPositionRestoration: 'enabled',
            relativeLinkResolution: 'legacy',
            // initialNavigation: 'disabled'
        }),
        NgbModule,
        ToastrModule.forRoot(),
        TranslateModule.forRoot(),
        ContextMenuModule,
        CoreModule.forRoot(coreConfig),
        CoreCommonModule,
        CoreSidebarModule,
        CoreThemeCustomizerModule,
        CardSnippetModule,
        LayoutModule,
        ContentHeaderModule,
        NgxDatatableModule
    ],
  providers: [
    LoaderService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
