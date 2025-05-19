import { getTagInfo, TAGS_MAP } from '@/components/displays/Types';
import {  
  earthquakeTag, 
  fireTag, 
  foundItemTag, 
  lostItemTag,
  otherCrimeTag,
} from '@/assets/tags';

// Mock the tag imports
jest.mock('@/assets/tags', () => ({
  assaultTag: '<svg>assault</svg>',
  earthquakeTag: '<svg>earthquake</svg>',
  fireTag: '<svg>fire</svg>',
  floodTag: '<svg>flood</svg>',
  foundItemTag: '<svg>found</svg>',
  harassmentTag: '<svg>harassment</svg>',
  lostItemTag: '<svg>lost</svg>',
  otherDisasterTag: '<svg>disaster</svg>',
  otherCrimeTag: '<svg>crime</svg>',
  theftTag: '<svg>theft</svg>'
}));

describe('Types.tsx tests', () => {
  describe('TAGS_MAP', () => {
    it('should have correct mapping for all tags', () => {
      // Test a few key mappings
      expect(TAGS_MAP["Lost Item"]).toEqual({
        icon: lostItemTag,
        color: "#9F3F3D"
      });
      
      expect(TAGS_MAP["Found Item"]).toEqual({
        icon: foundItemTag,
        color: "#5E9F3D"
      });
      
      expect(TAGS_MAP["Fire"]).toEqual({
        icon: fireTag,
        color: "#BA1A1A"
      });
      
      // Validate the structure for all tags
      Object.entries(TAGS_MAP).forEach(([tagName, tagInfo]) => {
        expect(tagInfo).toHaveProperty('icon');
        expect(tagInfo).toHaveProperty('color');
        expect(typeof tagInfo.icon).toBe('string');
        expect(typeof tagInfo.color).toBe('string');
      });
    });
    
    it('should include all expected tag keys', () => {
      const expectedTags = [
        "Lost Item",
        "Found Item", 
        "Theft",
        "Harassment",
        "Flood",
        "Assault",
        "Fire",
        "Other Natural Disasters",
        "Earthquake",
        "Other Crime",
        "Infrastructure Issue",
        "Crime Watch",
        "Lost Book",
        "Lost Pet",
        "Service Issue",
        "Flooding",
        "Stolen Vehicle"
      ];
      
      expectedTags.forEach(tag => {
        expect(TAGS_MAP).toHaveProperty(tag);
      });
    });
  });
  
  describe('getTagInfo', () => {
    it('should return correct tag info for known tags', () => {
      // Test several known tags
      expect(getTagInfo("Lost Item")).toEqual({
        icon: lostItemTag,
        color: "#9F3F3D"
      });
      
      expect(getTagInfo("Found Item")).toEqual({
        icon: foundItemTag,
        color: "#5E9F3D"
      });
      
      expect(getTagInfo("Earthquake")).toEqual({
        icon: earthquakeTag,
        color: "#745A2B"
      });
    });
    
    it('should return fallback tag info for unknown tags', () => {
      // Test with a tag that doesn't exist in the map
      expect(getTagInfo("NonExistentTag")).toEqual({
        icon: otherCrimeTag, 
        color: "#9F3F3D"
      });
      
      // Test with empty string
      expect(getTagInfo("")).toEqual({
        icon: otherCrimeTag, 
        color: "#9F3F3D"
      });
      
      // Test with undefined (type coercion)
      expect(getTagInfo(undefined as any)).toEqual({
        icon: otherCrimeTag, 
        color: "#9F3F3D"
      });
    });
    
    it('should handle case sensitivity correctly', () => {
      // Tags should be exact match (case-sensitive)
      expect(getTagInfo("lost item")).toEqual({
        icon: otherCrimeTag, 
        color: "#9F3F3D"
      });
      
      expect(getTagInfo("FIRE")).toEqual({
        icon: otherCrimeTag, 
        color: "#9F3F3D"
      });
    });
  });
  
  // For completeness, we could test type definitions, but they don't affect runtime coverage
  describe('Type definitions', () => {
    it('should export necessary types', () => {
      // This test is for documentation purposes only
      // TypeScript types don't exist at runtime, so we can't really test them
      
      // We're just verifying the file exports what we expect
      const types = require('@/components/displays/Types');
      expect(types).toHaveProperty('getTagInfo');
      expect(types).toHaveProperty('TAGS_MAP');
    });
  });
});