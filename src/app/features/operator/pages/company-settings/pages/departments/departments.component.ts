import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { TreeModule } from 'primeng/tree';
import { TreeNode } from 'primeng/api';

import { LoaderEmbedComponent } from '@app/shared';
import { DepartmentListItem } from '@app/core';
import { UIState, DepartmentsState } from './state';
import {
    AddChildDepartmentModalComponent,
    EditDepartmentModalComponent,
    DeleteDepartmentModalComponent,
} from './components';

@Component({
    standalone: true,
    selector: 'app-departments',
    templateUrl: './departments.component.html',
    styleUrls: ['./departments.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TreeModule,
        AddChildDepartmentModalComponent,
        EditDepartmentModalComponent,
        DeleteDepartmentModalComponent,
        LoaderEmbedComponent,
    ],
    providers: [UIState, DepartmentsState],
})
export class DepartmentsComponent {
    uiState = inject(UIState);
    departmentsState = inject(DepartmentsState);
    private destroyed$ = new Subject<void>();
    statuses$ = this.departmentsState.statuses$;
    treeData$ = new BehaviorSubject<TreeNode[]>([]);
    selectedNode: TreeNode | null = null;
    isActiveBtns: boolean = true;

    ngOnInit(): void {
        this.departmentsState.init();
        this.convertDepartmentsToTree();
    }

    private convertDepartmentsToTree(): void {
        this.departmentsState.departmentList$.subscribe((departments) => {
            const tree = this.buildTree(departments);
            this.treeData$.next(tree);
        });
    }

    private buildTree(departments: DepartmentListItem[]): TreeNode[] {
        const map = new Map<number, TreeNode>();
        const tree: TreeNode[] = [];

        departments.forEach((department) => {
            map.set(department.orgId, {
                data: department,
                label: department.orgName,
                expanded: true,
                children: [],
            });
        });

        departments.forEach((department) => {
            if (department.parentOrgId) {
                const parentNode = map.get(department.parentOrgId);
                if (parentNode) {
                    parentNode.children?.push(map.get(department.orgId)!);
                }
            } else {
                tree.push(map.get(department.orgId)!);
            }
        });

        return tree;
    }

    expandAll() {
        this.treeData$.subscribe((treeData) => {
            treeData.map((node) => {
                this.expandRecursive(node, true);
            });
        });
    }

    collapseAll() {
        this.treeData$.subscribe((treeData) => {
            treeData.map((node) => {
                this.expandRecursive(node, false);
            });
        });
    }

    private expandRecursive(node: TreeNode, isExpand: boolean) {
        node.expanded = isExpand;
        if (node.children) {
            node.children.forEach((childNode) => {
                this.expandRecursive(childNode, isExpand);
            });
        }
    }

    onNodeSelect(event: { node: TreeNode }) {
        this.selectedNode = event.node;
        this.isActiveBtns = false;
    }

    openAddChildDepartmentModal(): void {
        this.uiState.openAddChildDepartmentModal(this.selectedNode?.data);
    }

    editDepartmentModal(): void {
        this.uiState.openEditDepartmentModal(this.selectedNode?.data);
    }

    openDeleteDepartmentModal(): void {
        this.uiState.openRemoveDepartmentModal(this.selectedNode?.data);
    }

    refresh(): void {
        this.departmentsState.refresh();
    }

    ngOnDestroy(): void {
        this.destroyed$.next();
        this.destroyed$.complete();
    }
}
