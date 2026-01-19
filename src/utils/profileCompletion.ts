export const calculateProfileCompletion = (profile: any) => {
    if (!profile) return 0;

    // Fields that contribute to completion
    const fields = [
        profile.full_name,
        profile.avatar_url,
        profile.gender,
        profile.age,
        profile.height,
        profile.weight,
        profile.activity_level,
        profile.goal,
        profile.target_weight,
        profile.target_date
    ];

    // Filter out empty/null values
    const completedFields = fields.filter(
        (val) => val !== null && val !== undefined && val !== ''
    );

    return Math.round((completedFields.length / fields.length) * 100);
};
