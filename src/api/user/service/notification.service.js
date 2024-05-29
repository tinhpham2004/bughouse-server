const NotificationService = {};
const Notification = require('../../../model/user/notification.model');


NotificationService.getAll = async (
    conditions = {},
    pagination,
    sort = {}
) => {
    const filter = { ...conditions };
    const { limit, page, skip } = pagination;
    delete filter.limit;
    delete filter.page;

    const [items, total] = await Promise.all([
        Notification.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .populate([
                {
                    path: 'userOwner',
                    select: '_id username name avatar phone email'
                },
                {
                    path: 'tag',
                    select: '_id username name avatar phone email'
                }
            ])
            .lean(),
        Notification.countDocuments(filter),
    ]);
    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

NotificationService.checkNotification = async (notificationId) => {
    const notice = await Notification.findByIdAndUpdate(notificationId, { isChecked: true })
        .populate([
            {
                path: 'userOwner',
                select: '_id username name avatar phone email'
            },
            {
                path: 'tag',
                select: '_id username name avatar phone email'
            }
        ]).lean();

    if (!notice)
        throw new MyError('notification not found');

    return notice;
}
module.exports = NotificationService;