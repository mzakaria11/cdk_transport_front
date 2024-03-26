import {RouterModule, Routes} from "@angular/router";
import {Role} from "../../auth/models";
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {CoreCommonModule} from "../../../@core/common.module";
import {FormsModule} from "@angular/forms";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {NgSelectModule} from "@ng-select/ng-select";
import {Ng2FlatpickrModule} from "ng2-flatpickr";
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {CorePipesModule} from "../../../@core/pipes/pipes.module";
import {CoreDirectivesModule} from "../../../@core/directives/directives";
import {CoreSidebarModule} from "../../../@core/components";
import {ContentHeaderModule} from "../../layout/components/content-header/content-header.module";
import {TarifMssListComponent} from "./tarif-mss-list/tarif-mss-list.component";
import {TarifMssListService} from "./tarif-mss-list/tarif-mss-list.service";
import {TarifMssDetailComponent} from "./tarif-mss-detail/tarif-mss-detail.component";
import {TarifMssDetailService} from "./tarif-mss-detail/tarif-mss-detail.service";
import {TarifMssNewComponent} from "./tarif-mss-new/tarif-mss-new.component";
import {TarifMssNewService} from "./tarif-mss-new/tarif-mss-new.service";
import {FileUploadModule} from "ng2-file-upload";
import { TarifMssFullListComponent } from './tarif-mss-full-list/tarif-mss-full-list.component';

const routes: Routes = [
  {
    path: 'list',
    component: TarifMssListComponent,

    resolve: {
      tls: TarifMssListService
    },

    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'TarifMssListComponent' }
  },
  {
    path: 'fulllist/:id',
    component: TarifMssFullListComponent,

    resolve: {
            tls: TarifMssListService
    },

      data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'TarifMssFullListComponent' }
  },
  {
    path: 'detail/:id',
    component: TarifMssDetailComponent,
    resolve: {
      data: TarifMssDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'detail/:id', animation: 'TarifMssDetailComponent' }
  },
  {
    path: 'edit/:id',
    component: TarifMssDetailComponent,
    resolve: {
      data: TarifMssDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN], path: 'edit/:id', animation: 'TarifMssEditComponent' }
  },
  {
    path: 'new',
    component: TarifMssNewComponent,
    resolve: {
      tns: TarifMssNewService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN] }
  }
];


@NgModule({
  declarations: [
    TarifMssNewComponent,
    TarifMssListComponent,
    TarifMssDetailComponent,
    TarifMssFullListComponent
  ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),
        CoreCommonModule,
        FormsModule,
        NgbModule,
        NgSelectModule,
        Ng2FlatpickrModule,
        NgxDatatableModule,
        CorePipesModule,
        CoreDirectivesModule,
        CoreSidebarModule,
        ContentHeaderModule,
        FileUploadModule
    ]
})
export class TarifMssModule {



}
