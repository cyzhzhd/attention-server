export interface Data {
    token: string
    class: string
    session: string
}

export interface ContentData extends Data {
    sendTo: string
    content: string
}

export interface ConcentrationData extends Data {
    content: {
        absence: number,
        sleep: number,
        turnHead: number,
        focusPoint: number
    }
}