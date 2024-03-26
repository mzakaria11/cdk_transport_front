
import { RouterModule, Routes } from '@angular/router';

import { CoreSidebarModule } from '@core/components';
import { CoreDirectivesModule } from '@core/directives/directives';
import { CorePipesModule } from '@core/pipes/pipes.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CoreCommonModule } from '@core/common.module';
import { ContentHeaderModule } from 'app/layout/components/content-header/content-header.module';
import { Role } from 'app/auth/models';
import {CommonModule} from "@angular/common";
import {DepartementListComponent} from "./departement-list/departement-list.component";
import {DepartementDetailComponent} from "./departement-detail/departement-detail.component";
import {DepartementNewComponent} from "./departement-new/departement-new.component";
import {DepartementNewService} from "./departement-new/departement-new.service";
import {NgModule} from "@angular/core";
import {TransporteurListService} from "../transporteur/transporteur-list/transporteur-list.service";
import {DepartementListService} from "./departement-list/departement-list.service";
import {TransporteurDetailService} from "../transporteur/transporteur-detail/transporteur-detail.service";
import {DepartementDetailService} from "./departement-detail/departement-detail.service";

const routes: Routes = [
    {
        path: 'list',
        component: DepartementListComponent,

        resolve: {
            tls: DepartementListService
        },

        data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], animation: 'DepartementListComponent' }
    },
    {
        path: 'detail/:id',
        component: DepartementDetailComponent,
        resolve: {
            data: DepartementDetailService
        },
        data: { roles: [Role.Admin, Role.SUPER_ADMIN, Role.User], path: 'detail/:id', animation: 'TransporteurDetailComponent' }
    },
    {
        path: 'edit/:id',
        component: DepartementDetailComponent,
        resolve: {
            data: DepartementDetailService
        },
        data: { roles: [Role.Admin, Role.SUPER_ADMIN], path: 'edit/:id', animation: 'DepartementEditComponent' }
    },
    {
        path: 'new',
        component: DepartementNewComponent,
        resolve: {
            tns: DepartementNewService
        },
        data: { roles: [Role.Admin, Role.SUPER_ADMIN] }
    }
];

@NgModule({
    declarations: [
        DepartementNewComponent,
        DepartementListComponent,
        DepartementDetailComponent
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
        ContentHeaderModule
    ]
})
export class DepartementModule { }
