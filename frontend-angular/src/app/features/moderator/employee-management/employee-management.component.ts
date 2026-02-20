import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ModeratorService, Employee } from '../../../core/services/moderator.service';

@Component({
    selector: 'app-employee-management',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatDialogModule,
        MatSnackBarModule
    ],
    templateUrl: './employee-management.component.html',
    styleUrls: ['./employee-management.component.scss']
})
export class EmployeeManagementComponent implements OnInit {
    private moderatorService = inject(ModeratorService);
    private fb = inject(FormBuilder);
    private snackBar = inject(MatSnackBar);

    employees = signal<Employee[]>([]);
    displayedColumns: string[] = ['name', 'email', 'mobile', 'gender', 'role'];
    showAddForm = signal<boolean>(false);
    loading = signal<boolean>(false);

    employeeForm: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
        gender: ['OTHER', Validators.required]
    });

    ngOnInit() {
        this.loadEmployees();
    }

    async loadEmployees() {
        try {
            this.loading.set(true);
            const data = await this.moderatorService.getEmployees();
            this.employees.set(data);
        } catch (error) {
            this.showSnack('Failed to load employees');
        } finally {
            this.loading.set(false);
        }
    }

    async onSubmit() {
        if (this.employeeForm.invalid) return;

        try {
            this.loading.set(true);
            const newEmployee = await this.moderatorService.createEmployee(this.employeeForm.value);
            this.employees.update(list => [...list, newEmployee]);
            this.showSnack('Employee added successfully');
            this.toggleForm();
            this.employeeForm.reset({ gender: 'OTHER' });
        } catch (error: any) {
            this.showSnack(error.error?.message || 'Failed to add employee');
        } finally {
            this.loading.set(false);
        }
    }

    toggleForm() {
        this.showAddForm.update(v => !v);
    }

    private showSnack(message: string) {
        this.snackBar.open(message, 'Close', { duration: 3000 });
    }
}
