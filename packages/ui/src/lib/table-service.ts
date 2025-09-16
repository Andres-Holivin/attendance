import { prisma } from "@workspace/database";
import { TableQueryParams, TableQueryResult } from "../hooks/use-table-query";
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@workspace/ui/lib/common";

export interface TableServiceConfig<T> {
    tableName: keyof typeof prisma;
    searchFields?: (keyof T)[];
    filterFieldMap?: Record<string, string>;
    defaultOrderBy?: Record<string, 'asc' | 'desc'>;
    baseWhere?: any;
    include?: any; // Prisma include for relations
    select?: any; // Prisma select for specific fields
}

/**
 * Builds dynamic WHERE clause for Prisma queries based on filters
 */
export function buildWhereClause<T>(config: TableServiceConfig<T>, params: TableQueryParams): any {
    let where = { ...config.baseWhere };

    // Add search filter
    if (params.search && config.searchFields?.length) {
        const searchConditions = config.searchFields.map(field => ({
            [field as string]: {
                contains: params.search,
                mode: "insensitive"
            }
        }));

        where = {
            ...where,
            OR: searchConditions
        };
    }

    // Add column filters
    if (params.filters?.length) {
        // Filter out empty/invalid filters
        const validFilters = params.filters.filter(filter => {
            // Skip filters with empty values (except for isEmpty/isNotEmpty operators)
            if (filter.operator === 'isEmpty' || filter.operator === 'isNotEmpty') {
                return true;
            }
            return filter.value !== undefined && filter.value !== null && filter.value !== '';
        });

        if (validFilters.length === 0) {
            return where; // No valid filters, return current where clause
        }

        const filterConditions = validFilters.map(filter => {
            const fieldName = config.filterFieldMap?.[filter.id] || filter.id;
            const filterCondition: any = {};
            Object.assign(filterCondition, filterConditionToPrisma(fieldName, filter.operator, filter.value));
            return filterCondition;
        });
        // Apply joinOperator logic for multiple filters
        if (params.joinOperator === "or" && validFilters.length > 1) {

            // Combine base where with OR logic for filters
            if (Object.keys(where).length > 0) {
                // If we have base conditions (like baseWhere or search), combine them with AND
                where = {
                    AND: [
                        where,
                        { OR: filterConditions }
                    ]
                };
            } else {
                // If no base conditions, just use OR for filters
                where = { OR: filterConditions };
            }
        } else if (Object.keys(where).length > 0) {
            // If we have base conditions (like baseWhere or search), combine them with AND
            where = {
                AND: [
                    where,
                    { AND: filterConditions }
                ]
            };
        } else {
            // If no base conditions, just use AND for filters
            where = { AND: filterConditions };
        }
    }

    return where;
}

/**
 * Builds dynamic ORDER BY clause for Prisma queries
 */
export function buildOrderByClause<T>(config: TableServiceConfig<T>, params: TableQueryParams): any {
    if (params.sort?.length) {
        return params.sort.map(sortItem => ({
            [config.filterFieldMap?.[sortItem.id] || sortItem.id]: sortItem.desc ? 'desc' : 'asc'
        }));
    }

    return config.defaultOrderBy || {};
}

/**
 * Generic table service factory
 */
export async function createTableService<T>(config: TableServiceConfig<T>, params: TableQueryParams = {}): Promise<TableQueryResult<T>> {

    const { page = DEFAULT_PAGE_INDEX, perPage = DEFAULT_PAGE_SIZE } = params;
    const where = buildWhereClause(config, params);
    const orderBy = buildOrderByClause(config, params);
    const skip = (page - 1) * perPage;

    const table = prisma[config.tableName] as any;

    // Build query options
    const queryOptions: any = {
        where,
        skip,
        take: perPage,
        orderBy
    };

    // Add include if specified
    if (config.include) {
        queryOptions.include = config.include;
    }

    // Add select if specified (note: include and select cannot be used together)
    if (config.select && !config.include) {
        queryOptions.select = config.select;
    }

    const [data, total] = await Promise.all([
        table.findMany(queryOptions),
        table.count({ where })
    ]);

    return {
        data,
        totalItems: total,
        pageInfo: {
            page,
            perPage,
            totalPages: Math.ceil(total / perPage)
        }
    };
}

function filterConditionToPrisma(fieldName: string, operator: string | undefined, value: any): any {
    const condition: any = {};
    switch (operator) {
        case 'eq':
            condition[fieldName] = value;
            break;
        case 'iLike':
        case 'contains':
            condition[fieldName] = {
                contains: value,
                mode: "insensitive"
            };
            break;
        case 'in':
            condition[fieldName] = {
                in: Array.isArray(value) ? value : [value]
            };
            break;
        case 'gte':
            condition[fieldName] = { gte: value };
            break;
        case 'lte':
            condition[fieldName] = { lte: value };
            break;
        case 'gt':
            condition[fieldName] = { gt: value };
            break;
        case 'lt':
            condition[fieldName] = { lt: value };
            break;

        case 'not':


            condition[fieldName] = { not: value };
            break;
        case 'isEmpty':
            condition[fieldName] = null;
            break;
        case 'isNotEmpty':
            condition[fieldName] = { not: null };
            break;
        default:
            condition[fieldName] = value;
    }
    return condition;
}


