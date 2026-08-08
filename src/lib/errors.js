/* Ошибки несут код: текст для пользователя подбирает попап, а не библиотека. */
export function codedError(code, detail) {
  const error = new Error(detail ? `${code}: ${detail}` : code);
  error.code = code;
  error.detail = detail;
  return error;
}
