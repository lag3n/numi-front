import { Component, OnInit } from '@angular/core';
import { UserProcessService } from '../../services/user-process.service';
import { AdminService } from '../../services/admin.service';
import { UserAccessLog } from '../../models/userAccessLog.model';
import { UserAccessCount } from '../../models/userAccessCount.model';
import { UserAdmin } from '../../models/user-admin.model';
import { finalize } from 'rxjs/operators';
import { GridDataResult, PageChangeEvent } from '@progress/kendo-angular-grid';

@Component({
  selector: 'app-user-access',
  templateUrl: './user-access.component.html',
  styleUrls: ['./user-access.component.scss']
})
export class UserAccessComponent implements OnInit {
  // Make Math available to the template
  Math = Math;

  // Original user access data
  public userAccessCount: UserAccessCount = new UserAccessCount();
  public gridData: UserAccessLog[] = [];
  
  // User management data
  public users: UserAdmin[] = [];
  public selectedUser: UserAdmin | null = null;
  public editingCredits = false;
  public editingSubscription = false;
  public newCreditValue: number = 0;
  public newSubscriptionValue: string = '';
  
  // Subscription plan options
  public subscriptionPlans = [
    { value: 'none', text: 'None' },
    { value: 'basic', text: 'Basic' },
    { value: 'premium', text: 'Premium' },
    { value: 'enterprise', text: 'Enterprise' }
  ];
  
  public loading = false;
  public userLoading = false;

  // Grid settings
  public gridView: GridDataResult;
  public userGridView: GridDataResult;
  public pageSize = 10;
  public skip = 0;
  public userSkip = 0;

  constructor(
    private userService: UserProcessService,
    private adminService: AdminService
  ) { 
    this.gridView = { data: [], total: 0 };
    this.userGridView = { data: [], total: 0 };
  }

  ngOnInit(): void { 
    this.loadUserAccessList();
    this.loadAllUsers();
  }

  public pageChange(event: PageChangeEvent): void {
    this.skip = event.skip;
    this.loadPage();
  }
  
  public userPageChange(event: PageChangeEvent): void {
    this.userSkip = event.skip;
    this.loadUserPage();
  }

  private loadPage(): void {
    // Get the current page of data from gridData
    this.gridView = {
      data: this.gridData.slice(this.skip, this.skip + this.pageSize),
      total: this.gridData.length
    };
  }
  
  public loadUserPage(): void {
    // Get the current page of user data
    this.userGridView = {
      data: this.users.slice(this.userSkip, this.userSkip + this.pageSize),
      total: this.users.length
    };
  }

  private loadUserAccessList(): void {
    this.loading = true;
    this.userService.loadUserAccessList()
      .pipe(
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (userAccess) => {
          this.userAccessCount = userAccess.userAccessCount;
          this.gridData = userAccess.userAccessLogs;
          this.loadPage();
        },
        error: (error) => {
          console.error('Error loading user access list:', error);
        }
      });
  }
  
  private loadAllUsers(): void {
    this.userLoading = true;
    this.adminService.getAllUsers()
      .pipe(
        finalize(() => this.userLoading = false)
      )
      .subscribe({
        next: (response) => {
          this.users = response.users;
          this.loadUserPage();
        },
        error: (error) => {
          console.error('Error loading users:', error);
        }
      });
  }
  
  public handleSelectionChange(event: any): void {
    if (event && event.selectedRows && event.selectedRows.length > 0) {
      const user = event.selectedRows[0].dataItem;
      if (user) {
        this.selectUser(user);
      }
    }
  }

  public selectUser(user: UserAdmin): void {
    this.selectedUser = user;
    this.newCreditValue = user.credits;
    this.newSubscriptionValue = user.subscription_plan || 'none';
  }
  
  public startEditingCredits(): void {
    this.editingCredits = true;
  }
  
  public cancelEditingCredits(): void {
    if (this.selectedUser) {
      this.newCreditValue = this.selectedUser.credits;
    }
    this.editingCredits = false;
  }
  
  public saveCredits(): void {
    if (!this.selectedUser) return;
    
    this.userLoading = true;
    this.adminService.updateUserCredits(this.selectedUser.id, this.newCreditValue)
      .pipe(
        finalize(() => {
          this.userLoading = false;
          this.editingCredits = false;
        })
      )
      .subscribe({
        next: (updatedUser) => {
          // Update the user in the list
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.selectedUser = updatedUser;
          }
          this.loadUserPage();
        },
        error: (error) => {
          console.error('Error updating user credits:', error);
        }
      });
  }
  
  public startEditingSubscription(): void {
    this.editingSubscription = true;
  }
  
  public cancelEditingSubscription(): void {
    if (this.selectedUser) {
      this.newSubscriptionValue = this.selectedUser.subscription_plan || 'none';
    }
    this.editingSubscription = false;
  }
  
  public saveSubscription(): void {
    if (!this.selectedUser) return;
    
    this.userLoading = true;
    this.adminService.updateUserSubscription(this.selectedUser.id, this.newSubscriptionValue)
      .pipe(
        finalize(() => {
          this.userLoading = false;
          this.editingSubscription = false;
        })
      )
      .subscribe({
        next: (updatedUser) => {
          // Update the user in the list
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.selectedUser = updatedUser;
          }
          this.loadUserPage();
        },
        error: (error) => {
          console.error('Error updating user subscription:', error);
        }
      });
  }
}