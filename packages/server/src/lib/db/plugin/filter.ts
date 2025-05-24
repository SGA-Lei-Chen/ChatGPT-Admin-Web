import {
  type Column,
  type SQL,
  and,
  asc,
  between,
  desc,
  eq,
  gt,
  gte,
  inArray,
  isNotNull,
  isNull,
  like,
  lt,
  lte,
  ne,
  notBetween,
  notIlike,
  notInArray,
  or,
} from "drizzle-orm";
import type { PgColumn } from "drizzle-orm/pg-core";
import type { RuleGroupType, RuleType } from "react-querybuilder";

const convertRuleToDrizzle = (
  rule: RuleType,
  columns: Record<string, PgColumn>,
): SQL => {
  const column = columns[rule.field];
  if (!column) throw new Error(`Field not found: ${rule.field}`);

  switch (rule.operator) {
    case "=":
      return eq(column, rule.value);
    case "!=":
      return ne(column, rule.value);
    case "<":
      return lt(column, rule.value);
    case "<=":
      return lte(column, rule.value);
    case ">":
      return gt(column, rule.value);
    case ">=":
      return gte(column, rule.value);
    case "contains":
      return like(column, `%${rule.value}%`);
    case "beginsWith":
      return like(column, `${rule.value}%`);
    case "endsWith":
      return like(column, `%${rule.value}`);
    case "doesNotContain":
      return notIlike(column, `%${rule.value}%`);
    case "isNull":
      return isNull(column);
    case "isNotNull":
      return isNotNull(column);
    case "in":
      return inArray(column, rule.value as any[]);
    case "notIn":
      return notInArray(column, rule.value as any[]);
    case "between":
      const [start, end] = rule.value as [any, any];
      return between(column, start, end);
    case "notBetween":
      const [notStart, notEnd] = rule.value as [any, any];
      return notBetween(column, notStart, notEnd);
    default:
      throw new Error(`Unsupported operator: ${rule.operator}`);
  }
};

export const convertRuleGroupToDrizzle = (
  ruleGroup: RuleGroupType,
  columns: Record<string, PgColumn>,
): SQL | undefined => {
  const filters = ruleGroup.rules
    .map((rule) => {
      if ("combinator" in rule) {
        return convertRuleGroupToDrizzle(rule, columns);
      }
      return convertRuleToDrizzle(rule, columns);
    })
    .filter((f) => f !== undefined);
  if (filters.length === 0) return undefined;
  return ruleGroup.combinator === "and" ? and(...filters) : or(...filters);
};

export const convertOrderRulesToDrizzle = (
  orderRules: {
    field: string;
    direction: "asc" | "desc";
  }[],
  columns: Record<string, PgColumn>,
): SQL[] => {
  return orderRules.map((rule) => {
    const column = columns[rule.field];
    if (!column) throw new Error(`Field not found: ${rule.field}`);
    return rule.direction === "asc" ? asc(column) : desc(column);
  });
};
