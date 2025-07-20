import { Card, BlockStack, Text, Box } from "@shopify/polaris";

export function VideoCard() {
  return (
    <Card>
      <BlockStack >
        <Text as="h2" variant="headingMd">
          UpCart Setup & Demo
        </Text>
        <Text as="p" variant="bodyMd" tone="subdued">
          Learn how to configure your cart drawer, add upsells, and start increasing your average order value in just 3 minutes.
        </Text>
        
        <Box paddingBlockStart="400">
          <div style={{ 
            position: 'relative', 
            paddingBottom: '50%', // Increased from 35% to make video taller
            height: 0,
            maxWidth: '600px', // Added max width constraint
            margin: '0 auto' // Center the video
          }}>
            <iframe
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="UpCart Demo Video"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
                borderRadius: '8px'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Box>
      </BlockStack>
    </Card>
  );
}