export interface jobs_Body {
    

}

export interface jobs_Response {
    message: string,
    error?: string
    data?:string | any,
}
export interface individual_job {
    name: string,
    url: string,
    method: string | "GET" | "POST" | "DELETE" | "UPDATE" ,
    cron_expression: string | null,
    payload?: string,
    retries?: string,
    status?: "active" | "rejected" | "pending"
}
export interface createJobRequest {
    name: string,
    url: string,
    method: string | "GET" | "POST" | "DELETE" | "UPDATE" ,
    cron_expression: string | null,
    payload?: string,
    retries?: string,
    status?: "active" | "rejected" | "pending",
}

export interface postJobInterface{
    name: string,
    url: string,
    payload: JSON,
    retries:number | string | null
}