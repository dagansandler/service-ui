/*
 * Copyright 2025 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Mock data matching the TmsTestFolderRS API response structure
 * This simulates the response from GET /project/{projectKey}/tms/folder
 *
 * Note: The API returns a flat list of folders with parentFolderId references.
 * The UI reconstructs the tree structure client-side using these references.
 */
/**
 * Empty mock response for testing the empty state
 */
export const MOCK_TMS_FOLDERS_EMPTY_RESPONSE = {
  content: [],
  page: {
    size: 30,
    number: 0,
    totalElements: 0,
    totalPages: 0,
  },
};

export const MOCK_TMS_FOLDERS_RESPONSE = {
  content: [
    // Root folders
    {
      id: 1,
      name: 'Checkout flow',
      description: 'E-commerce checkout functionality tests',
      countOfTestCases: 2048,
      parentFolderId: null,
    },
    {
      id: 2,
      name: 'Order history',
      description: 'Order history and management tests',
      countOfTestCases: 48,
      parentFolderId: null,
    },
    {
      id: 11,
      name: 'Profile update',
      description: 'User profile management',
      countOfTestCases: 100,
      parentFolderId: null,
    },
    {
      id: 13,
      name: 'Browser compatibility',
      description: 'Cross-browser testing',
      countOfTestCases: 1200,
      parentFolderId: null,
    },
    {
      id: 15,
      name: 'Password Reset Procedures and Guidelines for User Account Management',
      description: 'Comprehensive password reset testing',
      countOfTestCases: 8192,
      parentFolderId: null,
    },
    {
      id: 25,
      name: 'Empty Folder Example',
      description: 'This folder has no test cases yet',
      countOfTestCases: 0,
      parentFolderId: null,
    },
    {
      id: 26,
      name: 'New Feature Testing',
      description: 'Recently created folder for new features',
      countOfTestCases: 0,
      parentFolderId: null,
    },
    {
      id: 17,
      name: 'Product search',
      description: 'Product search functionality',
      countOfTestCases: 1024,
      parentFolderId: null,
    },
    {
      id: 19,
      name: 'Payment processing',
      description: 'Payment gateway integration',
      countOfTestCases: 1024,
      parentFolderId: null,
    },
    {
      id: 21,
      name: 'User login',
      description: 'User authentication flow',
      countOfTestCases: 204,
      parentFolderId: null,
    },
    {
      id: 23,
      name: 'Account registration',
      description: 'New user registration',
      countOfTestCases: 4096,
      parentFolderId: null,
    },

    // Child folders (level 1)
    {
      id: 3,
      name: 'Data migration',
      description: 'Order data migration tests',
      countOfTestCases: 8,
      parentFolderId: 2,
    },
    {
      id: 7,
      name: 'Search filters',
      description: 'Product search and filtering',
      countOfTestCases: 40,
      parentFolderId: 2,
    },
    {
      id: 9,
      name: 'Security features',
      description: 'Security and authentication tests',
      countOfTestCases: 5,
      parentFolderId: 2,
    },
    {
      id: 12,
      name: 'Profile update management',
      description: 'Profile editing functionality',
      countOfTestCases: 25,
      parentFolderId: 11,
    },
    {
      id: 14,
      name: 'Browser compatibility system',
      description: 'Browser-specific tests',
      countOfTestCases: 20,
      parentFolderId: 13,
    },
    {
      id: 16,
      name: 'Password Reset Procedures and Guidelines',
      description: 'Password reset workflow tests',
      countOfTestCases: 42,
      parentFolderId: 15,
    },
    {
      id: 18,
      name: 'Product search type',
      description: 'Search type categorization',
      countOfTestCases: 4,
      parentFolderId: 17,
    },
    {
      id: 20,
      name: 'Payment processing type',
      description: 'Payment method tests',
      countOfTestCases: 4,
      parentFolderId: 19,
    },
    {
      id: 22,
      name: 'User login type',
      description: 'Login method variations',
      countOfTestCases: 42,
      parentFolderId: 21,
    },
    {
      id: 24,
      name: 'Account registration type',
      description: 'Registration flow variations',
      countOfTestCases: 42,
      parentFolderId: 23,
    },
    {
      id: 27,
      name: 'Empty Subfolder',
      description: 'Child folder with no tests',
      countOfTestCases: 0,
      parentFolderId: 2,
    },

    // Child folders (level 2)
    {
      id: 4,
      name: 'Email notifications',
      description: 'Email notification system tests',
      countOfTestCases: 30,
      parentFolderId: 3,
    },
    {
      id: 8,
      name: 'Search filters system',
      description: 'Advanced search functionality',
      countOfTestCases: 425,
      parentFolderId: 7,
    },
    {
      id: 10,
      name: 'Authentication system',
      description: 'User authentication tests',
      countOfTestCases: 55,
      parentFolderId: 9,
    },

    // Child folders (level 3)
    {
      id: 5,
      name: 'Cart management',
      description: 'Shopping cart functionality',
      countOfTestCases: 25,
      parentFolderId: 4,
    },

    // Child folders (level 4)
    {
      id: 6,
      name: 'Cart management system',
      description: 'Advanced cart system tests',
      countOfTestCases: 125,
      parentFolderId: 5,
    },
  ],
  page: {
    size: 30,
    number: 0,
    totalElements: 27, // Updated count to include new empty folders
    totalPages: 1,
  },
};

/**
 * Mock error response for testing error handling
 */
export const MOCK_TMS_FOLDERS_ERROR = {
  error: 'Internal Server Error',
  message: 'Unable to fetch TMS folders',
  status: 500,
};
