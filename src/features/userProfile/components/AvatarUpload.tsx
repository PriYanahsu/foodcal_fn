'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CameraIcon } from '@heroicons/react/24/outline';
import { AvatarUploadProps } from '../type';

export default function AvatarUpload({ uid, url, onUpload, size = 150, isEditing }: AvatarUploadProps) {
    const supabase = createClient();
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (url) downloadImage(url);
    }, [url]);

    async function downloadImage(path: string) {
        try {
            const { data, error } = await supabase.storage.from('avatars').download(path);
            if (error) {
                throw error;
            }
            const url = URL.createObjectURL(data);
            setAvatarUrl(url);
        } catch (error) {
            console.log('Error downloading image: ', error);
        }
    }

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const filePath = `${uid}-${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            onUpload(filePath);
        } catch (error) {
            alert('Error uploading avatar! Ensure "avatars" bucket exists in Supabase Storage.');
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
                    className={`${isEditing ? 'border-4 border-white' : 'border-[var(--card-border)]'} rounded-full object-cover shadow-lg`}
                    style={{ height: size, width: size }}
                />
            ) : (
                <div
                    className="rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-white font-bold border-4 border-[var(--background)] shadow-lg"
                    style={{ height: size, width: size, fontSize: size * 0.4 }}
                >
                    ?
                </div>
            )}

            <div style={{ width: size }} className="absolute bottom-0 left-0 right-0 flex justify-center">
                {isEditing && (<label
                    htmlFor="single"
                    className="bg-[var(--card-bg)] p-2 rounded-full cursor-pointer hover:bg-gray-700 transition-colors border border-[var(--card-border)] shadow-md"
                >
                    {uploading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-[var(--primary)] border-t-transparent rounded-full" />
                    ) : (
                        <CameraIcon className="h-5 w-5 text-gray-300" />
                    )}
                </label>
                )}
                <input
                    style={{
                        visibility: 'hidden',
                        position: 'absolute',
                    }}
                    type="file"
                    id="single"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                />
            </div>
        </div>
    );
}
