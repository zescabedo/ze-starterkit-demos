import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text, Field, LinkField } from '@sitecore-content-sdk/nextjs';
import { ButtonBase as Button } from '@/components/button-component/ButtonComponent';

interface FooterNavigationCalloutFields {
  title?: Field<string>;
  description?: Field<string>;
  linkOptional?: LinkField;
}

interface FooterNavigationCalloutProps {
  fields: FooterNavigationCalloutFields;
}

export const Default: React.FC<FooterNavigationCalloutProps> = ({ fields }) => {
  const { title, description, linkOptional } = fields;

  return (
    <aside>
      <Card className="rounded-[24px] border border-footer-border bg-footer-bg p-2 text-footer-text shadow-none">
        <CardHeader className="flex flex-row justify-between pb-4">
          <CardTitle className="font-heading text-xl font-bold uppercase tracking-wide text-footer-heading">
            <Text tag="span" field={title} />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Text field={description} className="font-body text-sm leading-relaxed text-footer-text" />
          {linkOptional && (
            <Button
              variant="outline"
              className="mt-10 block w-full rounded-full border-2 border-footer-heading bg-transparent text-center font-heading font-bold uppercase text-footer-heading hover:bg-surface-subtle hover:text-footer-heading"
              buttonLink={linkOptional}
              contextTitle={title?.value}
            />
          )}
        </CardContent>
      </Card>
    </aside>
  );
};
