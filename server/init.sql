create table conversations
(
    id         bigint auto_increment comment '对话的唯一标识符，主键'
        primary key,
    user_id    bigint                              not null comment '关联的用户ID，对应users表的主键',
    title      varchar(255)                        not null comment '对话的标题',
    created_at timestamp default CURRENT_TIMESTAMP not null comment '对话创建时间',
    updated_at timestamp default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '对话最后更新时间'
);

create index idx_user_id
    on conversations (user_id);

create table documents
(
    id                bigint auto_increment
        primary key,
    knowledge_base_id bigint                                                not null,
    file_name         varchar(255)                                          not null,
    file_url          varchar(255)                                          not null,
    file_size         bigint                                                null comment '字节',
    processing_status enum ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED') null,
    created_at        timestamp default CURRENT_TIMESTAMP                   null,
    updated_at        timestamp default CURRENT_TIMESTAMP                   null on update CURRENT_TIMESTAMP
);

create table knowledge_bases
(
    id          bigint auto_increment
        primary key,
    user_id     bigint                              not null,
    name        varchar(255)                        not null,
    description text                                null,
    created_at  timestamp default CURRENT_TIMESTAMP null,
    updated_at  timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
);

create table levels
(
    id          int auto_increment comment '等级的唯一标识符，主键，自增长'
        primary key,
    name        enum ('Public', 'Internal', 'Confidential', 'Restricted', 'Top-Secret') not null comment '等级名称，使用ENUM类型确保数值的规范性',
    priority    tinyint unsigned                                                        not null comment '优先级排序字段，数字越小代表优先级越高，用于排序和权限判断',
    description text                                                                    null comment '对该等级的详细文字描述，方便理解其具体用途',
    created_at  timestamp default CURRENT_TIMESTAMP                                     null comment '记录创建时间，在插入数据时自动设置为当前时间',
    updated_at  timestamp default CURRENT_TIMESTAMP                                     null on update CURRENT_TIMESTAMP comment '记录最后更新时间，每当记录被修改时会自动刷新为当前时间',
    constraint name
        unique (name),
    constraint priority
        unique (priority)
)
    comment '用户或数据的安全/访问等级定义表';

create table messages
(
    id              bigint auto_increment comment '消息的唯一标识符，主键'
        primary key,
    conversation_id bigint                              not null comment '所属对话的ID',
    role            enum ('user', 'assistant')          not null comment '消息发送者的角色 (user 或 assistant)',
    content         text                                not null comment '消息的具体内容',
    created_at      timestamp default CURRENT_TIMESTAMP not null comment '消息创建时间'
)
    comment '对话消息表';

create index idx_conversation_id
    on messages (conversation_id);

create table nodes
(
    id          varchar(255)                        not null
        primary key,
    document_id bigint                              not null,
    context     text                                null,
    created_at  timestamp default CURRENT_TIMESTAMP null,
    updated_at  timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP
);

create table refresh_tokens
(
    id            bigint auto_increment
        primary key,
    user_id       bigint                               not null,
    refresh_token char(64)                             not null,
    expires_at    datetime                             not null,
    created_at    datetime   default CURRENT_TIMESTAMP null,
    revoked       tinyint(1) default 0                 null,
    constraint refresh_token
        unique (refresh_token)
);

create table user
(
    id         bigint auto_increment
        primary key,
    username   varchar(64)                         not null,
    password   varchar(100)                        not null,
    created_at timestamp default CURRENT_TIMESTAMP null,
    updated_at timestamp default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    level_id   int                                 null,
    avatar_url varchar(255)                        null,
    constraint username
        unique (username)
)
    charset = utf8mb4;

