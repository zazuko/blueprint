import { Routes } from '@angular/router';
import { InventoryComponent } from './inventory/inventory.component';
import { InventoryDetailComponent } from './inventory-detail/inventory-detail.component';


export const INVENTORY_ROUTES: Routes = [
    { path: '', component: InventoryComponent },
    { path: 'hierarchy/:id', component: InventoryDetailComponent },
    { path: 'test/x', component: InventoryDetailComponent }
];
