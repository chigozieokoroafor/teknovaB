const toJSON = function() {
    const copy = { ...this };
    return copy;
};

function addPrototypeHelpers(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
        obj.forEach(item => addPrototypeHelpers(item));
        return obj;
    }
    
    Object.defineProperty(obj, 'toJSON', {
        value: toJSON,
        enumerable: false,
        configurable: true
    });
    
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (val && typeof val === 'object') {
            addPrototypeHelpers(val);
        }
    }
    
    return obj;
}

function buildPrismaWhere(obj) {
    if (obj === null || obj === undefined) {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(buildPrismaWhere);
    }

    if (typeof obj !== 'object' || obj instanceof Date) {
        return obj;
    }

    const prismaWhere = {};

    for (const key of Object.keys(obj)) {
        const val = obj[key];
        
        if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
            const symbols = Object.getOwnPropertySymbols(val);
            if (symbols.length > 0) {
                const mappedVal = {};
                for (const sym of symbols) {
                    const opName = sym.description || sym.toString().replace(/^Symbol\(|\)$/g, '');
                    const opVal = val[sym];
                    
                    if (opName === 'gte') {
                        mappedVal.gte = Number.isNaN(Number(opVal)) ? opVal : Number(opVal);
                    } else if (opName === 'lte') {
                        mappedVal.lte = Number.isNaN(Number(opVal)) ? opVal : Number(opVal);
                    } else if (opName === 'gt') {
                        mappedVal.gt = Number.isNaN(Number(opVal)) ? opVal : Number(opVal);
                    } else if (opName === 'lt') {
                        mappedVal.lt = Number.isNaN(Number(opVal)) ? opVal : Number(opVal);
                    } else if (opName === 'like') {
                        const cleanStr = typeof opVal === 'string' ? opVal.replace(/^%|%$/g, '') : opVal;
                        mappedVal.contains = cleanStr;
                    } else if (opName === 'between') {
                        if (Array.isArray(opVal) && opVal.length === 2) {
                            mappedVal.gte = Number.isNaN(Number(opVal[0])) ? opVal[0] : Number(opVal[0]);
                            mappedVal.lte = Number.isNaN(Number(opVal[1])) ? opVal[1] : Number(opVal[1]);
                        }
                    } else if (opName === 'in') {
                        mappedVal.in = opVal;
                    } else if (opName === 'notIn') {
                        mappedVal.notIn = opVal;
                    } else if (opName === 'not') {
                        mappedVal.not = buildPrismaWhere(opVal);
                    }
                }
                
                for (const subKey of Object.keys(val)) {
                    mappedVal[subKey] = buildPrismaWhere(val[subKey]);
                }
                
                prismaWhere[key] = mappedVal;
            } else {
                prismaWhere[key] = buildPrismaWhere(val);
            }
        } else {
            prismaWhere[key] = val;
        }
    }

    const rootSymbols = Object.getOwnPropertySymbols(obj);
    for (const sym of rootSymbols) {
        const opName = sym.description || sym.toString().replace(/^Symbol\(|\)$/g, '');
        const val = obj[sym];
        
        if (opName === 'and') {
            if (Array.isArray(val)) {
                prismaWhere.AND = val.map(buildPrismaWhere);
            }
        } else if (opName === 'or') {
            if (Array.isArray(val)) {
                prismaWhere.OR = val.map(buildPrismaWhere);
            }
        }
    }

    return prismaWhere;
}

module.exports = {
    buildPrismaWhere,
    addPrototypeHelpers
};
