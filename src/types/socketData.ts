export interface Data {
    token: string
    class: string
    session: string
}

export interface ContentData extends Data {
    sendTo: string
    content: string
}
