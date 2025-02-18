declare const DEFINES: {
    android?: boolean
} | undefined;

const defines = typeof DEFINES === "undefined"? { } : DEFINES;

export default defines;