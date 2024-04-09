import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaxeDetailComponent } from './taxe-detail/taxe-detail.component';
import { TaxeListComponent } from './taxe-list/taxe-list.component';
import { TaxeNewComponent } from './taxe-new/taxe-new.component';
import {ContentHeaderModule} from "../../layout/components/content-header/content-header.module";
import {CoreDirectivesModule} from "../../../@core/directives/directives";
import {FileUploadModule} from "ng2-file-upload";
import {NgSelectModule} from "@ng-select/ng-select";
import {NgbModule, NgbNavModule} from "@ng-bootstrap/ng-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule, Routes} from "@angular/router";

import {Role} from "../../auth/models";


import {TaxeListService} from "./taxe-list/taxe-list.service";
import {TaxeNewService} from "./taxe-new/taxe-new.service";
import {CoreCommonModule} from "../../../@core/common.module";
import {Ng2FlatpickrModule} from "ng2-flatpickr";
import {NgxDatatableModule} from "@swimlane/ngx-datatable";
import {CorePipesModule} from "../../../@core/pipes/pipes.module";
import {CoreSidebarModule} from "../../../@core/components";
import {TaxeDetailService} from "./taxe-detail/taxe-detail.service";
import {TarifMssListComponent} from "../tarif-mss/tarif-mss-list/tarif-mss-list.component";
import {TarifMssListService} from "../tarif-mss/tarif-mss-list/tarif-mss-list.service";


const routes: Routes = [
    {
        path: 'list',
        component: TaxeListComponent,



        data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'TaxeListComponent' }
    },

    {
        path: 'detail',
        component: TaxeDetailComponent,
        resolve: {
            data: TaxeDetailService
        },
        data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'detail', animation: 'TaxeDetailComponent' }
    },
    {
        path: 'edit/:id',
        component: TaxeDetailComponent,
        resolve: {
            data: TaxeDetailService
        },
        data: { roles: [Role.Admin, Role.SUPER_ADMIN], path: 'edit/:id', animation: 'TaxeEditComponent' }
    },
    {
        path: 'new',
        component: TaxeNewComponent,
        resolve: {
            tns: TaxeNewService
        },
        data: { roles: [Role.Admin, Role.SUPER_ADMIN] }
    }
];

@NgModule({
  declarations: [
    TaxeDetailComponent,
    TaxeListComponent,
    TaxeNewComponent
  ],
    imports: [
        FormsModule,
        NgbModule,
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


export class TaxeModule { }
