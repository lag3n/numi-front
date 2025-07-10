import { UserAccessCount } from "../models/userAccessCount.model"
import { UserAccessLog } from "../models/userAccessLog.model"

export class UserAccess {
    public userAccessCount: UserAccessCount = new UserAccessCount();
    public userAccessLogs: UserAccessLog[] = [];
}