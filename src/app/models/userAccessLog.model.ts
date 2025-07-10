export class UserAccessLog {
    public Id: number = 0;
    public  UserId: number = 0;
    public  IPAddress: string = "";
    public  AccessToday: number = 0;
    public  AccessCount: number = 0;
    public  Comment: string = "";
    public  Country: string = "";
    public  Province: string = "";
    public  City: string = "";
    public  Latitude: number = 0;
    public  Longitude: number = 0;
    public  TotalAccessCount: number = 0;
    public  AccessDate?: Date;
    public  LastAccessDateTime?: Date;
    public  StartDatetime?: Date;
    public  EndDatetime?: Date
}