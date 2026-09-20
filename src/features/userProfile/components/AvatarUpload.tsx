'use client';

import { useEffect, useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { AvatarUploadProps } from '../type';

export default function AvatarUpload({
  uid,
  url,
  onUpload,
  size = 150,
  isEditing,
  initials,
  inputId,
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  const showImage = Boolean(url) && !failed;
  // Two avatar pickers can be mounted at once (row + sheet); each needs its own id.
  const fileInputId = inputId ?? `avatar-${uid}`;

  return (
    <div className="relative group">
      {showImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={url ?? undefined}
          alt="Avatar"
          referrerPolicy="no-referrer"
          onLoad={() => setFailed(false)}
          onError={() => setFailed(true)}
          className="rounded-full border-2 border-[var(--card-border)] object-cover shadow-lg"
          style={{ height: size, width: size, maxWidth: '100%' }}
        />
      ) : (
        <div
          className="rounded-full bg-[var(--primary)] flex items-center justify-center text-black font-bold border-2 border-[var(--card-border)] shadow-lg"
          style={{ height: size, width: size, fontSize: size * 0.36, maxWidth: '100%' }}
        >
          {initials || '?'}
        </div>
      )}

      {isEditing && (
        <div className="absolute bottom-1 right-1">
          <label
            htmlFor={fileInputId}
            className="bg-[var(--card-bg)] p-1.5 rounded-full cursor-pointer hover:bg-gray-700 transition-colors border border-[var(--card-border)] shadow-md flex items-center justify-center"
          >
            {uploading ? (
              <div className="animate-spin h-3.5 w-3.5 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
            ) : (
              <CameraIcon className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            )}
          </label>
        </div>
      )}
      <div style={{ width: size }} className="absolute bottom-0 left-0 right-0 flex justify-center">
        <input
          style={{ visibility: 'hidden', position: 'absolute' }}
          type="file"
          id={fileInputId}
          accept="image/*"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            setUploading(true);
            try {
              await onUpload(file); // change prop to (file: File) => Promise<void>
            } finally {
              setUploading(false);
              event.target.value = '';
            }
          }}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
