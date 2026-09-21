/**
 * Canonical Device & User-Agent Parsing Pure Helpers (Phase 01-C6)
 * 
 * Provides robust, dependency-free classification of client platforms,
 * browsers, device categories, and human-readable device labels.
 */

'use strict';

/**
 * Parses a raw User-Agent string into structured client metadata.
 * 
 * @param {string | null | undefined} uaString
 * @returns {{
 *   platform: string,
 *   browser: string,
 *   deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown',
 *   deviceLabel: string
 * }}
 */
function parseUserAgent(uaString) {
  if (!uaString || typeof uaString !== 'string') {
    return {
      platform: 'Không xác định',
      browser: 'Trình duyệt không xác định',
      deviceType: 'unknown',
      deviceLabel: 'Thiết bị không xác định',
    };
  }

  const ua = uaString;

  // 1. Detect Platform / Operating System
  let platform = 'Khác';
  if (/Windows NT 10|Windows NT 11/i.test(ua)) {
    platform = 'Windows';
  } else if (/Windows/i.test(ua)) {
    platform = 'Windows';
  } else if (/iPhone/i.test(ua)) {
    platform = 'iOS (iPhone)';
  } else if (/iPad/i.test(ua)) {
    platform = 'iPadOS';
  } else if (/Android/i.test(ua)) {
    platform = 'Android';
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    platform = 'macOS';
  } else if (/CrOS/i.test(ua)) {
    platform = 'ChromeOS';
  } else if (/Linux/i.test(ua)) {
    platform = 'Linux';
  }

  // 2. Detect Browser
  let browser = 'Trình duyệt web';
  if (/Edg\//i.test(ua)) {
    browser = 'Microsoft Edge';
  } else if (/OPR\/|Opera/i.test(ua)) {
    browser = 'Opera';
  } else if (/SamsungBrowser/i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/Chrome\/|CriOS\//i.test(ua)) {
    browser = 'Google Chrome';
  } else if (/Firefox\/|FxiOS\//i.test(ua)) {
    browser = 'Mozilla Firefox';
  } else if (/Safari/i.test(ua) && !/Chrome|CriOS/i.test(ua)) {
    browser = 'Apple Safari';
  }

  // 3. Detect Device Type
  let deviceType = 'desktop';
  if (/Mobile|iPhone|Android.*Mobile/i.test(ua)) {
    deviceType = 'mobile';
  } else if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    deviceType = 'tablet';
  }

  // 4. Construct Human-Readable Device Label
  let deviceLabel = `${platform} (${browser})`;
  if (platform === 'iOS (iPhone)') {
    deviceLabel = `iPhone • ${browser}`;
  } else if (platform === 'iPadOS') {
    deviceLabel = `iPad • ${browser}`;
  } else if (platform === 'Android') {
    deviceLabel = `Thiết bị Android • ${browser}`;
  } else if (platform === 'Windows') {
    deviceLabel = `Máy tính Windows • ${browser}`;
  } else if (platform === 'macOS') {
    deviceLabel = `Máy Mac • ${browser}`;
  } else if (platform === 'Linux') {
    deviceLabel = `Máy tính Linux • ${browser}`;
  }

  return {
    platform,
    browser,
    deviceType,
    deviceLabel,
  };
}

/**
 * Sanitizes IP addresses to protect privacy while retaining diagnostic utility.
 * Masks the last octet for IPv4 (e.g. 192.168.1.xxx) or host portion for IPv6.
 * 
 * @param {string | null | undefined} rawIp
 * @returns {string | null}
 */
function sanitizeIp(rawIp) {
  if (!rawIp || typeof rawIp !== 'string') {
    return null;
  }
  let clean = rawIp.trim();
  if (!clean) return null;

  if (clean.startsWith('::ffff:')) {
    clean = clean.replace('::ffff:', '');
  }

  // Handle IPv4
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(clean)) {
    const parts = clean.split('.');
    return `${parts[0]}.${parts[1]}.${parts[2]}.*`;
  }

  // Handle IPv6
  if (clean.includes(':')) {
    const segments = clean.split(':');
    if (segments.length >= 3) {
      return `${segments[0]}:${segments[1]}:${segments[2]}:*`;
    }
  }

  return clean;
}

/**
 * Formats relative time in Vietnamese matching Project UI Rules (Task 19).
 * - < 1 phút: vài giây trước
 * - < 1 giờ: X phút trước
 * - < 1 ngày: X giờ trước
 * - < 1 tháng: X ngày trước
 * - < 1 năm: X tháng trước
 * - >= 1 năm: X năm trước
 * 
 * @param {number | Date} timestamp
 * @param {number} [now=Date.now()]
 * @returns {string}
 */
function formatRelativeTimeVi(timestamp, now = Date.now()) {
  const timeMs = typeof timestamp === 'number' ? timestamp : (timestamp instanceof Date ? timestamp.getTime() : (timestamp?.toMillis ? timestamp.toMillis() : 0));
  if (!timeMs) return 'Không rõ';

  const diffMs = Math.max(0, now - timeMs);
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (seconds < 60) {
    return 'Vừa xong';
  }
  if (minutes < 60) {
    return `${minutes} phút trước`;
  }
  if (hours < 24) {
    return `${hours} giờ trước`;
  }
  if (days < 30) {
    return `${days} ngày trước`;
  }
  if (months < 12) {
    return `${months} tháng trước`;
  }
  return `${years} năm trước`;
}

module.exports = {
  parseUserAgent,
  sanitizeIp,
  formatRelativeTimeVi,
};
