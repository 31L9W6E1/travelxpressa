interface UserAvatarProps {
    name?: string | null;
    email?: string | null;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}
export declare function UserAvatar({ name, email, size, className }: UserAvatarProps): import("react/jsx-runtime").JSX.Element;
export default UserAvatar;
