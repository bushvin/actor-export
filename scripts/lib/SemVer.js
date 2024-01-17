/**
 * SemVer module
 * @module SemVer
 * @author William Leemans
 * @copyright William Leemans 2024
 */

/**
 * @class
 * A simple class to compare semantic version strings
 */
export class semVer {
    /**
     * Parse the given semantic version and return an Array with version information
     * @param {string} version A semantically correct version
     * @returns {Array} [major, minor, bugfix, all other]
     */
    static parseSemanticVersion(version) {
        let major = 0;
        let minor = 0;
        let bugfix = 0;
        let release = '';

        version = version.split(/\.(.*)/s);
        major = parseInt(version[0]);

        if (version.length > 2) {
            version = version[1].split(/\.(.*)/s);
            minor = parseInt(version[0]);
        }

        if (version.length > 2) {
            version = version[1].split(/-(.*)/s);
            bugfix = parseInt(version[0]);
            release = version[1];
        }

        return [major, minor, bugfix, release];
    }

    /**
     * Check if both given versions are the same
     * @param {string} source version to be compared with
     * @param {string} target version to compare
     * @returns {boolean} Whether or not the versions are identical
     */
    static eq(source, target) {
        source = this.parseSemanticVersion(source);
        target = this.parseSemanticVersion(target);
        if (JSON.stringify(source) == JSON.stringify(target)) {
            return true;
        }
        return false;
    }

    /**
     * Check if versions are not equal (different)
     * @param {string} source version to be compared with
     * @param {string} target version to compare
     * @returns {boolean} Whether or not the versions are **NOT** identical
     */
    static ne(source, target) {
        return !this.eq(source, target);
    }

    /**
     * Check if the target version is greater than the source
     * @param {string} source version to be compared with
     * @param {string} target version to compare
     * @returns {boolean} Whether or not the target version is greater than the source version
     */
    static gt(source, target) {
        source = this.parseSemanticVersion(source);
        target = this.parseSemanticVersion(target);
        if (source[0] > target[0]) {
            return true;
        } else if (source[0] == target[0]) {
            if (source[1] > target[1]) {
                return true;
            } else if (source[1] == target[1]) {
                if (source[2] > target[2]) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if the target version is greater than or equal to the source
     * @param {string} source version to be compared with
     * @param {string} target version to compare
     * @returns {boolean} Whether or not the target version is greater than or equal to the source version
     */
    static gte(source, target) {
        if (this.eq(source, target)) {
            return true;
        }
        return this.gt(source, target);
    }

    /**
     * Check if the target version is less than the source
     * @param {string} source version to be compared with
     * @param {string} target version to compare
     * @returns {boolean} Whether or not the target version is less than the source version
     */
    static lt(source, target) {
        source = this.parseSemanticVersion(source);
        target = this.parseSemanticVersion(target);
        if (source[0] < target[0]) {
            return true;
        } else if (source[0] == target[0]) {
            if (source[1] < target[1]) {
                return true;
            } else if (source[1] == target[1]) {
                if (source[2] < target[2]) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if the target version is less than or equal to the source
     * @param {string} source version to be compared with
     * @param {string} target version to compare
     * @returns {boolean} Whether or not the target version is less than or equal to the source version
     */
    static lte(source, target) {
        if (this.eq(source, target)) {
            return true;
        }
        return this.lt(source, target);
    }
}
