'use client';

import React, { useEffect, useState } from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { AvatarUploadProps } from '../type';

export default function AvatarUpload({
  uid,
  url,
  onUpload,
  size = 150,
  isEditing,
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setAvatarUrl(url);
  }, [url]);

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      if (!file) throw new Error('You must select an image to upload.');
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setAvatarUrl(dataUrl);
      onUpload(dataUrl);
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative group">
      {avatarUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={avatarUrl}
          alt="Avatar"
          className={`${isEditing ? 'border-4 border-[var(--foreground)]' : 'border-[var(--card-border)]'} rounded-full object-cover shadow-lg`}
          style={{ height: size, width: size, maxWidth: '100%' }}
        />
      ) : (
        <div
          className="rounded-full bg-[var(--primary)] flex items-center justify-center text-black font-bold border-4 border-[var(--background)] shadow-lg"
          style={{ height: size, width: size, fontSize: size * 0.4, maxWidth: '100%' }}
        >
          ?
        </div>
      )}

      {isEditing && (
        <div className="absolute bottom-1 right-1">
          <label
            htmlFor={`avatar-${uid}`}
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
          id={`avatar-${uid}`}
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  );
}
