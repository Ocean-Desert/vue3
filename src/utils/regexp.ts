/** email格式 */
export const Email = /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/g

/** 只包含中文、英文、下划线 */
export const Name = /^[\u4e00-\u9fa5A-Za-z0-9_]+$/g

/** 密码(长度在6~30之间，只能包含字母、数字和下划线) */
export const Password = /^[A-Za-z0-9_]{6,30}$/g
