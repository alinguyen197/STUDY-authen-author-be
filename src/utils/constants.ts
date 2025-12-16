export const REGEX = {
  /**
   * Link Refer: https://github.com/colinhacks/zod/blob/main/packages/zod/src/v3/types.ts Line 617
   */
  EMAIL_RFC5322_CUSTOM:
    /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9-]*\.)+[A-Z]{1,}$/i,

  /**Regex Expression for BE/FE
   * Link Refer: https://insight.fsoft.com.vn/confluence/spaces/RIMOKEY/pages/546839516/Regular+expression
   */

  /** /^[a-zA-Z0-9｡-ￜ￨-￮]+$/ */
  HALF_WIDTH_PATTERN:
    /[\u0020-\u007F\uFF61-\uFFEE\u0061-\u007A\u0041-\u005A\u0030-\u0039\uFF61-\uFFDC\uFFE8-\uFFEE]+/u,

  /** /^[a-zA-Z]+$/ */
  HALF_WIDTH_ALPHABET_PATTERN: /[\u{0061}-\u{007A}\u{0041}-\u{005A}]+/u,

  /** /^[a-z]+$/ */
  HALF_WIDTH_ALPHABET_LOWERCASE_PATTERN: /[\u{0061}-\u{007A}]+/u,

  /** /^[A-Z]+$/ */
  HALF_WIDTH_ALPHABET_UPPERCASE_PATTERN: /[\u{0041}-\u{005A}]+/u,

  /** /^[a-zA-Z0-9]+$/ */
  HALF_WIDTH_ALPHABET_NUMBER_PATTERN: /^[a-zA-Z0-9!-~]+$/,

  /** /^[0-9]+$/ */
  HALF_WIDTH_DIGIT_PATTERN: /[\u{0030}-\u{0039}]+/u,

  /** /^[-|+]?[0-9]+(\.[0-9]+)?$/ */
  HALF_WIDTH_NUMBER_PATTERN:
    /[\u{002B}\u{002D}]?[\u{0030}-\u{0039}]+[\u{002E}\u{0030}-\u{0039}]+?/u,

  /** /^[ｧ-ﾝﾞﾟ]+$/ */
  HALF_WIDTH_KATAKANA_PATTERN: /[\u{FF5F}-\u{FF9F}]+/u,

  /** /^[０-９]+$/ */
  FULL_WIDTH_DIGIT_PATTERN: /[\u{FF10}-\u{FF19}]+/u,

  /** /^[ー|＋]?[０-９]+(\．[０-９]+)?$/ */
  FULL_WIDTH_NUMBER_PATTERN:
    /[\u{FF0B}\u{FF0D}]?[\u{FF10}-\u{FF19}]+[\u{FF0E}\u{FF10}-\u{FF19}]+?/u,

  /** /^[ぁ-ん]+$/ */
  FULL_WIDTH_HIRAGANA_PATTERN: /^[ぁ-ん]+$/,

  /** /^([ァ-ン]|ー)+$/ */
  FULL_WIDTH_KATAKANA_PATTERN: /[\u{30A0}-\u{30FF}]+/u,

  /** /^[ぁ-んァ-ン]+$/ */
  FULL_WIDTH_HIRAGANA_KATAKANA_PATTERN:
    /[\u{3041}-\u{3096}\u{30A0}-\u{30FF}]+/u,

  /** /^[一-龥]+$/ */
  KANJI_PATTERN: /[\u{3400}-\u{4DB5}\u{4E00}-\u{9FCB}\u{F900}-\u{FA6A}]+/u,

  /** /^[一-龥ぁ-ん]/ */
  FULL_WIDTH_HIRAGANA_KANJI_PATTERN:
    /[\u{3041}-\u{3096}\u{3400}-\u{4DB5}\u{4E00}-\u{9FCB}\u{F900}-\u{FA6A}]+/u,

  /** /^[ぁ-んァ-ン一-龥]/ */
  FULL_WIDTH_HIRAGANA_KATAKANA_KANJI_PATTERN:
    /[\u{3041}-\u{3096}\u{30A0}-\u{30FF}\u{3400}-\u{4DB5}\u{4E00}-\u{9FCB}\u{F900}-\u{FA6A}]+/u,

  /** [Ａ-ｚ] */
  FULL_WIDTH_LETTER_PATTERN: /[\u{FF01}-\u{FF5E}]+/u,

  /** /^[ぁ-んァ-ン一-龥、-〿]+$/ */
  FULL_WIDTH_HIRAGANA_KATAKANA_KANJI_PUNC_SYMBOLS_PATTERN:
    /[\u{3041}-\u{3096}\u{30A0}-\u{30FF}\u{3400}-\u{4DB5}\u{4E00}-\u{9FCB}\u{F900}-\u{FA6A}\u{3000}-\u{303F}]+/u,

  /** /^[A-Za-z0-9Ａ-Ｚａ-ｚ０-９ｦ-ﾟ]+$/ */
  HALF_FULL_ALPHANUMERIC_AND_HALF_KANA:
    /^[\p{ASCII}\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFF9D]+$/u,

  /** Time format yyyy/mm/dd */
  TIME_yyyy_mm_dd: /^(19|20)\d{2}\/(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/,

  /** /^[a-zA-Zぁ-んァ-ン一-龥ｧ-ﾝﾞﾟ]+$/ */
  JAPANESE_ALPHABET_HIRAGANA_KATAKANA_KANJI_PATTERN:
    /^[\u{0061}-\u{007A}\u{0041}-\u{005A}\u{3400}-\u{4DB5}\u{4E00}-\u{9FCB}\u{F900}-\u{FA6A}\u{3041}-\u{3096}\u{30A0}-\u{30FF}\u{FF5F}-\u{FF9F}]+$/u,

  /** 
    Half-width letters: A-Z, a-z
    Half-width digits: 0-9
    Half-width symbols: ! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ \ { | } ~`
   */
  HALF_ALPHA_CHARACTER_SYMBOLS: /^[!-~]+$/,

  /** 
    Half-width letters: A-Z, a-z
    Half-width digits: 0-9
    Half-width symbols: - . @
   */
  HALF_ALPHA_CHARACTER_SYMBOLS_AHD: /^[A-Za-z0-9.@-]+$/,

  /** Contain at least one alphabetic character (uppercase and lowercase), one number, and one symbol. */
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,

  /** The Japanese phone number format (090, 080, 070) or a landline number with an area code. */
  JP_PHONE_NUMBER: /^(?:0(?:70|80|90)\d{8}|0\d{1,4}-?\d{1,4}-?\d{4})$/,

  /** /^[0-9-]+$/ */
  HALF_WIDTH_DIGIT_HYPHEN_PATTERN: /^[0-9-]+$/,

  /**
   * Full-width: Japanese Hiragana, Kanji, Katakana (full-width), Japanese symbols, full-width ASCII symbols
   * Half-width English letters and digits, with no other characters allowed
   */
  REGEX_LATIN_ALPHANUM_FULL_HALF_WIDTH_AND_HALFWIDTH_KANA:
    /^[\p{Script=Hiragana}\p{Script=Han}\u30A0-\u30FF\u31F0-\u31FF\u3000-\u303F\uFF01-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFF60\uFFE0-\uFFEEA-Za-z0-9!-~]+$/u,

  HALF_FULL_WIDTH_ALPHANUMERIC_PATTERN:
    /^[a-zA-Z0-9Ａ-ｚ０-９一-龥ぁ-んァ-ン、。・「」…]+$/,

  /**
   * Regular expression for: - Half-width Latin letters and digits (A-Z, a-z, 0-9) - Japanese
   * Hiragana \x{3041}-\x{3096} - Full-width Katakana \x{30A0}-\x{30FF} - Kanji
   * \x{3400}-\x{4DBF}\x{4E00}-\x{9FFF}\x{F900}-\x{FAFF} - Full-width special characters
   * \x{FF01}-\x{FF0F}\x{FF1A}-\x{FF20}\x{FF3B}-\x{FF40}\x{FF5B}-\x{FF60} Excludes full-width Latin
   * letters/digits and half-width Katakana.
   */
  HALF_FULL_WIDTH_ALPHANUMERIC_FULL_KATA_PATTERN:
    /^[A-Za-z0-9!-~\u3041-\u3096\u30A0-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF01-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFF60\u3000-\u303F]+$/u,
}

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status}
 */
export enum EHttpStatuses {
  OK = 200,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  InternalServerError = 500,
  ServiceUnavailable = 503,
}

export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
  REFRESH_TOKEN_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  MAX_ACTIVE_TOKENS: parseInt(process.env.MAX_ACTIVE_TOKENS || '5'),
}

export const OTP_CONFIG = {
  ENABLED: process.env.OTP_ENABLED === 'true',
  EXPIRATION: parseInt(process.env.OTP_EXPIRATION || '300'), // seconds
  MAX_ATTEMPTS: parseInt(process.env.OTP_MAX_ATTEMPTS || '3'),
  RATE_LIMIT: parseInt(process.env.OTP_RATE_LIMIT || '3'), // requests per 15 min
  LENGTH: 6,
}

export const REDIS_KEYS = {
  REFRESH_TOKEN: (tokenHash: string) => `refresh_token:${tokenHash}`,
  OTP_RATE_LIMIT: (userId: number) => `otp_rate_limit:${userId}`,
  OTP_ATTEMPTS: (userId: number) => `otp_attempts:${userId}`,
}

export const RATE_LIMIT_CONFIG = {
  REFRESH_ENDPOINT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
  },
}
