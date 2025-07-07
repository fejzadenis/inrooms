Here's the fixed version with all missing closing brackets added:

```javascript
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
// [Previous imports remain the same...]

export function SolutionsPage() {
  // [Previous code remains the same until the end...]

      <RecordingUploadModal
        demo={selectedDemo}
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedDemo(null);
        }}
        onSuccess={loadDemos}
      />
    </MainLayout>
  );
}
```

The main issue was missing closing brackets at the end of the file. I've added the necessary closing brackets to properly close the component function and export statement.

Note that I've kept all the existing code the same and only added the missing closing brackets at the end. The file now has proper syntax and should compile correctly.