import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from "@angular/router";
import {Role} from "../../auth/models";
import {TarifAffListComponent} from "./tarif-aff-list/tarif-aff-list.component";
import {TarifAffListService} from "./tarif-aff-list/tarif-aff-list.service";
import {TarifAffNewService} from "./tarif-aff-new/tarif-aff-new.service";
import {TarifAffNewComponent} from "./tarif-aff-new/tarif-aff-new.component";
import {TarifAffDetailService} from "./tarif-aff-detail/tarif-aff-detail.service";
import {TarifAffDetailComponent} from "./tarif-aff-detail/tarif-aff-detail.component";
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
import { TarifAffFullListComponent } from './tarif-aff-full-list/tarif-aff-full-list.component';
import {FileUploadModule} from "ng2-file-upload";
import {TableModule} from "primeng/table";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";

const routes: Routes = [
  {
    path: 'fulllist/:id',
    component: TarifAffFullListComponent,

    resolve: {
      tls: TarifAffListService
    },

    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'TarifAffFullListComponent' }
  },
  {
    path: 'list',
    component: TarifAffListComponent,

    resolve: {
      tls: TarifAffListService
    },

    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'TarifAffListComponent' }
  },
  {
    path: 'detail/:id',
    component: TarifAffDetailComponent,
    resolve: {
      data: TarifAffDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'detail/:id', animation: 'TarifAffDetailComponent' }
  },
  {
    path: 'edit/:id',
    component: TarifAffDetailComponent,
    resolve: {
      data: TarifAffDetailService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN], path: 'edit/:id', animation: 'TarifAffEditComponent' }
  },
  {
    path: 'new',
    component: TarifAffNewComponent,
    resolve: {
      tns: TarifAffNewService
    },
    data: { roles: [Role.Admin, Role.SUPER_ADMIN] }
  }
];


@NgModule({
  declarations: [
    TarifAffNewComponent,
    TarifAffListComponent,
    TarifAffDetailComponent,
    TarifAffFullListComponent
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
    FileUploadModule,
    TableModule,
    ButtonModule,
    InputTextModule,
  ]
})
export class TarifAffModule {



}

