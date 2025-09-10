class Address {
  constructor(province, ward, street) {
    if (province) this.province = province;
    if (ward) this.ward = ward;
    if (street) this.street = street;
  }

  // Validate address object
  static validate(addressData) {
    if (!addressData) return { valid: true };

    const { province, ward, street } = addressData;

    // Validate province
    if (
      province !== undefined &&
      (typeof province !== "string" || province.trim().length > 100)
    ) {
      return {
        valid: false,
        message: "Tỉnh/Thành phố không được vượt quá 100 ký tự",
      };
    }

    // Validate ward
    if (
      ward !== undefined &&
      (typeof ward !== "string" || ward.trim().length > 100)
    ) {
      return {
        valid: false,
        message: "Quận/Huyện/Phường/Xã không được vượt quá 100 ký tự",
      };
    }

    // Validate street
    if (
      street !== undefined &&
      (typeof street !== "string" || street.trim().length > 200)
    ) {
      return {
        valid: false,
        message: "Địa chỉ cụ thể không được vượt quá 200 ký tự",
      };
    }

    return { valid: true };
  }

  // Sanitize address data
  static sanitize(addressData) {
    if (!addressData) return null;

    const sanitized = {};
    if (addressData.province !== undefined)
      sanitized.province = addressData.province.trim();
    if (addressData.ward !== undefined)
      sanitized.ward = addressData.ward.trim();
    if (addressData.street !== undefined)
      sanitized.street = addressData.street.trim();

    // Return null if all fields are empty
    if (Object.keys(sanitized).length === 0) return null;

    return sanitized;
  }

  // Create from raw data
  static fromData(addressData) {
    if (!addressData) {
      return {
        province: null,
        ward: null,
        street: null,
      };
    }

    return {
      province: addressData.province || null,
      ward: addressData.ward || null,
      street: addressData.street || null,
    };
  }

  // Convert to display string
  toString() {
    const parts = [];
    if (this.street) parts.push(this.street);
    if (this.ward) parts.push(this.ward);
    if (this.province) parts.push(this.province);
    return parts.join(", ");
  }
}

module.exports = Address;
