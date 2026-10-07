/** 把对象里所有字符串叶子的类型放宽为 string，保留嵌套结构。 */
export type DeepString<T> = { [K in keyof T]: T[K] extends string ? string : DeepString<T[K]> }
