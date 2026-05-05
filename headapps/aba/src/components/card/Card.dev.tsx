import {
  RichText,
  Text,
  Field,
  ImageField,
  LinkField,
  Link,
} from '@sitecore-content-sdk/nextjs';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Default as Icon } from '@/components/icon/Icon';
import { Default as ImageWrapper } from '@/components/image/ImageWrapper.dev';
import { IconName } from '@/enumerations/Icon.enum';
import { EnumValues } from '@/enumerations/generic.enum';
import { cn } from '@/lib/utils';
import { getDescriptiveLinkText } from '@/utils/link-text';

type CardProps = {
  heading: Field<string>; // Sitecore editable text field
  description: Field<string>;
  image?: ImageField; // Sitecore editable image field
  link: LinkField; // Sitecore editable link field
  icon?: EnumValues<typeof IconName>;
  className?: string;
  editable?: boolean;
};

export const Default: React.FC<CardProps> = (props) => {
  const { image, heading, description, link, className, icon, editable } =
    props;

  // Generate descriptive link text for SEO (only in production, preserve CMS text in editing mode)
  const displayText = editable
    ? link?.value?.text
    : getDescriptiveLinkText(link, heading?.value);

  // Create a modified link field with descriptive text for SEO
  const enhancedLink = !editable && displayText && displayText !== link?.value?.text
    ? {
        ...link,
        value: {
          ...link?.value,
          text: displayText,
        },
      }
    : link;

  return (
    <Card
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-border shadow-[0_0_5px_0_rgba(0,0,0,0.1)]',
        className
      )}
    >
      <ImageWrapper
        image={image}
        className="aspect-video w-full rounded-t-xl object-cover"
      />
      <CardHeader>
        <CardTitle className="font-heading text-card-foreground text-2xl font-bold leading-tight tracking-tight">
          <Text field={heading} />
        </CardTitle>
        <RichText
          field={description}
          className="text-foreground [&_a]:text-brand-link [&_a:hover]:text-brand-navy"
        />
      </CardHeader>
      {link && (
        <CardFooter>
          <Button asChild>
            <Link editable={editable} field={enhancedLink}>
              {editable && (
                <>
                  {link?.value?.text}{' '}
                  <Icon iconName={icon ? icon : IconName.INTERNAL} />
                </>
              )}
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
