export interface CountryList {
    code2: string;
    code3: string;
    name: string;
    capital: string;
    region: string;
    subregion: string;
    states: StatesList[];
}

export interface StatesList {
    code: string;
    name: string;
    subdivision: string | null;
}
