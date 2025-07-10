export class User {
    constructor(
        public id: number,
        public firstName: string,
        public lastName: string,
        public email: string,
        public role: string,
        public status: boolean,
        public createdAt?: Date,
        public updatedAt?: Date
    ) {}

    // You can add methods
    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    isAdmin(): boolean {
        return this.role.toLowerCase() === 'admin';
    }
}